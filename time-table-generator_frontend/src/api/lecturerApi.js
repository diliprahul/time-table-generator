import axios from "axios";

const BASE_URL = "http://localhost:8080";
const API = `${BASE_URL}/lecturers`;

export async function getLecturers() {
  const res = await axios.get(`${API}/all`);
  return res.data;
}

export async function addLecturer(lecturer) {
  // lecturer = { lecturerName: "Dilip" }
  const res = await axios.post(`${API}/add`, lecturer);
  return res.data;
}

export async function deleteLecturer(id) {
  return axios.delete(`${API}/${id}`);
}
