import axios from "axios";

const BASE_URL = "http://localhost:8080";
const API = `${BASE_URL}/sections`;

export async function getSections() {
  const res = await axios.get(`${API}/all`);
  return res.data;
}

export async function addSection(section) {
  // section = { sectionName: "cse", ... }
  const res = await axios.post(`${API}/add`, section);
  return res.data;
}

export async function deleteSection(id) {
  return axios.delete(`${API}/${id}`);
}
