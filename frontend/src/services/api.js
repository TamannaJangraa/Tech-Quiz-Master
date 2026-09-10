const IS_LOCAL = window.location.hostname === "localhost";
const BASE_URL = IS_LOCAL
  ? "http://localhost:8080/api"
  : "https://tech-quiz-master-bcknd.vercel.app/api";

export const apiRequest = async (
  endpoint,
  method = "GET",
  body = null,
  token = null
) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(errorData.message || "Something went wrong");
  }

  return response.json();
};

export const registerStudent = async (data, token) => {
  return apiRequest("/users/register", "POST", data, token);
};
