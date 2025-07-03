import axios from "axios";

const API = axios.create({
  baseURL: "http://43.204.238.225:8000", // Django local server
  withCredentials: false,
});

export default API;
