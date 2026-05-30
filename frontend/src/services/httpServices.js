import axios from "axios";
import http from "http";

const isServer = typeof window === "undefined";

// Prefer IPv4 on server (Windows often resolves localhost to ::1 first)
const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
  "://localhost",
  "://127.0.0.1"
);

const instance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 50000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  ...(isServer && {
    httpAgent: new http.Agent({ family: 4 }),
  }),
});

export const setToken = (token) => {
  // console.log("token", token);
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common["Authorization"];
  }
};

const responseBody = (response) => response.data;

const requests = {
  get: (url, body) => instance.get(url, body).then(responseBody),
  post: (url, body, headers) =>
    instance.post(url, body, headers).then(responseBody),
  put: (url, body) => instance.put(url, body).then(responseBody),
  delete: (url) => instance.delete(url).then(responseBody),
};

export default requests;
