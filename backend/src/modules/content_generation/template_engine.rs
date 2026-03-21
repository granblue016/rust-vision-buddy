use crate::modules::content_generation::models::ExtractedMetadata;
use regex::Regex;
use std::sync::OnceLock;
use tera::{Context, Tera};

static TEMPLATES: OnceLock<Tera> = OnceLock::new();

pub fn init_templates() -> Result<(), tera::Error> {
    let tera = Tera::new("templates/**/*.tera")?;
    TEMPLATES
        .set(tera)
        .map_err(|_| tera::Error::msg("Failed to initialize templates - already initialized"))?;
    Ok(())
}

fn get_templates() -> &'static Tera {
    TEMPLATES.get().expect("Templates not initialized")
}

fn normalize_style(style: &str) -> &'static str {
    match style.trim().to_lowercase().as_str() {
        "formal" => "formal",
        "casual" => "casual",
        "concise" => "concise",
        "persuasive" => "persuasive",
        "modern" => "casual",
        "creative" => "persuasive",
        _ => "auto",
    }
}

fn auto_style_from_jd(jd_text: &str, language: &str) -> &'static str {
    let jd_lower = jd_text.to_lowercase();
    let lang = language.trim().to_lowercase();

    let formal_markers_vi = [
        "tập đoàn",
        "ngân hàng",
        "tuân thủ",
        "quy trình",
        "enterprise",
    ];
    let formal_markers_en = [
        "corporation",
        "bank",
        "compliance",
        "governance",
        "enterprise",
    ];
    let persuasive_markers = [
        "marketing",
        "sales",
        "growth",
        "brand",
        "business development",
    ];
    let concise_markers = ["startup", "fast-paced", "remote", "product", "agile"];

    if persuasive_markers.iter().any(|m| jd_lower.contains(m)) {
        return "persuasive";
    }
    if concise_markers.iter().any(|m| jd_lower.contains(m)) {
        return "concise";
    }

    if lang == "vi" {
        if formal_markers_vi.iter().any(|m| jd_lower.contains(m)) {
            return "formal";
        }
        return "casual";
    }

    if formal_markers_en.iter().any(|m| jd_lower.contains(m)) {
        return "formal";
    }
    "casual"
}

fn resolve_style(style: &str, jd_text: &str, language: &str) -> &'static str {
    let normalized = normalize_style(style);
    if normalized == "auto" {
        return auto_style_from_jd(jd_text, language);
    }
    normalized
}

fn clean_line(line: &str) -> String {
    line.replace('\u{feff}', "")
        .replace('\t', " ")
        .replace('|', " ")
        .replace('•', " ")
        .replace('●', " ")
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
}

fn trim_trailing_punctuation(text: &str) -> String {
    text.trim()
        .trim_end_matches(|c: char| [',', ';', ':', '.'].contains(&c))
        .to_string()
}

fn looks_like_name(line: &str) -> bool {
    let trimmed = line.trim();
    if trimmed.is_empty() || trimmed.len() < 4 || trimmed.len() > 60 {
        return false;
    }

    let lower = trimmed.to_lowercase();
    let blocked_tokens = [
        "cv",
        "resume",
        "email",
        "phone",
        "address",
        "experience",
        "skills",
        "github",
        "linkedin",
    ];
    if blocked_tokens.iter().any(|token| lower.contains(token)) {
        return false;
    }
    if trimmed.chars().any(|c| c.is_ascii_digit()) {
        return false;
    }

    let words = trimmed.split_whitespace().collect::<Vec<_>>();
    (2..=6).contains(&words.len())
}

fn extract_candidate_name(cv_text: &str) -> String {
    let lines: Vec<String> = cv_text.lines().map(clean_line).collect();
    let name_re = Regex::new(r"(?i)(full\s*name|họ\s*và\s*tên|name)[:：-]\s*([^,\n;]+)").unwrap();

    for line in &lines {
        if let Some(cap) = name_re.captures(line) {
            let n = clean_line(&cap[2]);
            if looks_like_name(&n) {
                return n;
            }
        }
    }

    for line in &lines {
        if looks_like_name(line) {
            return line.clone();
        }
    }
    "Ứng viên".to_string()
}

fn extract_years_experience(cv_text: &str) -> String {
    let re = Regex::new(r"(\d+)\s*\+?\s*(year|năm)").unwrap();
    re.captures(cv_text)
        .map(|c| c[1].to_string())
        .unwrap_or_else(|| "3".to_string())
}

fn extract_email(cv_text: &str) -> Option<String> {
    let re = Regex::new(r"(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b").unwrap();
    re.find(cv_text).map(|m| m.as_str().to_string())
}

fn extract_phone(cv_text: &str) -> Option<String> {
    let re = Regex::new(r"(\+?\d[\d\s.-]{8,15}\d)").unwrap();
    re.find(cv_text).map(|m| m.as_str().trim().to_string())
}

fn extract_address(cv_text: &str) -> Option<String> {
    let re = Regex::new(r"(?i)(address|địa\s*chỉ)[:：-]\s*(.+)").unwrap();
    for line in cv_text.lines() {
        if let Some(cap) = re.captures(line) {
            return Some(clean_line(&cap[2]));
        }
    }
    None
}

fn extract_key_skills(cv_text: &str) -> String {
    let skill_patterns = [
        "python",
        "java",
        "javascript",
        "typescript",
        "react",
        "node",
        "docker",
        "rust",
        "sql",
        "aws",
        "git",
        "linux",
        "ci/cd",
        "agile",
    ];
    let lower = cv_text.to_lowercase();
    let mut found = Vec::new();
    for skill in skill_patterns {
        if lower.contains(skill) {
            found.push(skill);
        }
    }

    if found.is_empty() {
        "Software Development, Problem Solving".to_string()
    } else {
        found.join(", ")
    }
}

fn extract_certificates(cv_text: &str) -> Option<String> {
    let re = Regex::new(r"(?i)(certificate|chứng\s*chỉ)[:：-]\s*(.+)").unwrap();
    cv_text
        .lines()
        .find_map(|l| re.captures(l).map(|c| clean_line(&c[2])))
}

fn extract_company_name(jd_text: &str) -> String {
    let re = Regex::new(r"(?i)(company|công\s*ty)[:：-]\s*([^,\n;]+)").unwrap();
    jd_text
        .lines()
        .find_map(|l| re.captures(l).map(|c| clean_line(&c[2])))
        .unwrap_or_else(|| "Quý công ty".to_string())
}

fn extract_recipient(jd_text: &str, language: &str) -> String {
    let lang_vi = language.contains("vi");
    let re = Regex::new(r"(?i)(dear|kính\s*gửi|attention)[:：]?\s*([^,\n;]+)").unwrap();

    jd_text
        .lines()
        .find_map(|l| re.captures(l).map(|c| clean_line(&c[2])))
        .unwrap_or_else(|| {
            if lang_vi {
                "Bộ phận Tuyển dụng".to_string()
            } else {
                "Hiring Manager".to_string()
            }
        })
}

fn extract_position(jd_text: &str) -> String {
    let re = Regex::new(r"(?i)(position|vị\s*trí)[:：-]\s*([^,\n;]+)").unwrap();
    jd_text
        .lines()
        .find_map(|l| re.captures(l).map(|c| clean_line(&c[2])))
        .unwrap_or_else(|| "Software Engineer".to_string())
}

pub fn extract_metadata(cv_text: &str, jd_text: &str, language: &str) -> ExtractedMetadata {
    ExtractedMetadata {
        candidate_name: extract_candidate_name(cv_text),
        recipient: extract_recipient(jd_text, language),
        company_name: extract_company_name(jd_text),
        position: extract_position(jd_text),
        years_experience: extract_years_experience(cv_text),
        key_skills: extract_key_skills(cv_text),
        certificates: extract_certificates(cv_text),
        email: extract_email(cv_text),
        phone: extract_phone(cv_text),
        address: extract_address(cv_text),
    }
}

fn build_context(cv_text: &str, jd_text: &str, language: &str) -> Context {
    let mut ctx = Context::new();
    let meta = extract_metadata(cv_text, jd_text, language);
    ctx.insert("candidate_name", &meta.candidate_name);
    ctx.insert("years_experience", &meta.years_experience);
    ctx.insert("key_skills", &meta.key_skills);
    ctx.insert("company_name", &meta.company_name);
    ctx.insert("position", &meta.position);
    ctx.insert("recipient", &meta.recipient);
    if let Some(e) = meta.email {
        ctx.insert("email", &e);
    }
    if let Some(p) = meta.phone {
        ctx.insert("phone", &p);
    }
    ctx
}

pub fn render_email_subject(
    cv: &str,
    jd: &str,
    lang: &str,
    style: &str,
) -> Result<String, tera::Error> {
    let s = resolve_style(style, jd, lang);
    let name = format!("email_subject_{}_{}.tera", s, lang);
    get_templates().render(&name, &build_context(cv, jd, lang))
}

pub fn render_email_body(
    cv: &str,
    jd: &str,
    lang: &str,
    style: &str,
) -> Result<String, tera::Error> {
    let s = resolve_style(style, jd, lang);
    let name = format!("email_body_{}_{}.tera", s, lang);
    get_templates().render(&name, &build_context(cv, jd, lang))
}

pub fn render_cover_letter(
    cv: &str,
    jd: &str,
    lang: &str,
    style: &str,
) -> Result<String, tera::Error> {
    let s = resolve_style(style, jd, lang);
    let name = format!("cover_letter_{}_{}.tera", s, lang);
    get_templates().render(&name, &build_context(cv, jd, lang))
}
