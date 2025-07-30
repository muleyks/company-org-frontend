import axios from "axios";

const api = axios.create({
  baseURL:
    "https://demo-project-6-env.eba-bub3hufq.eu-north-1.elasticbeanstalk.com", //backend's base URL
});

export default api;
