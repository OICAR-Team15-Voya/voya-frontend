import axios from 'axios';

// Create a reusable axios instance configured to call the backend API.
// It sets the base URL for all requests and sends JSON content by default.
export const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

