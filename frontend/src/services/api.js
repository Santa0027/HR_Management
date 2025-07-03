import axios from "axios";

const API = axios.create({
  baseURL: "http://13.200.243.54 :8000", // Django local server
  withCredentials: false,
});

export default API;
