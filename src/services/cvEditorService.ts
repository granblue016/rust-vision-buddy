const BASE_URL = "http://localhost:9000/api/v1/cvs";

export const cvEditorService = {
  async list() {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch CV list");
    return res.json();
  },

  async getById(id: string) {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) throw new Error("Failed to fetch CV");
    return res.json();
  },

  async update(id: string, layout_data: unknown) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layout_data }),
    });
    if (!res.ok) throw new Error("Failed to update CV");
    return res.json();
  },
};
