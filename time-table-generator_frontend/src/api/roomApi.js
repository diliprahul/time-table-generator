import axios from "axios";

const BASE_URL = "http://localhost:8080";
const API = `${BASE_URL}/rooms`;

export async function getRooms() {
  const res = await axios.get(`${API}/all`);
  return res.data;
}

export async function addRoom(room) {
  // room = { roomNumber: "101" }
  const res = await axios.post(`${API}/add`, room);
  return res.data;
}

export async function deleteRoom(id) {
  return axios.delete(`${API}/${id}`);
}
