import axios from "axios";
import CONFIG from "./Config";

const api = axios.create({
  baseURL: CONFIG.apiEndpoint,
});

export default api;