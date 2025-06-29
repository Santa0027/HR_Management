import axios from "axios";

const API = axios.create({
  baseURL: "http://13.204.66.176:8000", // Django local server
  withCredentials: false,
});

export default API;
