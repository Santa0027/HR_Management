import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000", // Django local server (updated port)
  withCredentials: false,
});

export default API;
