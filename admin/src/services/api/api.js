import { useAuth } from '@clerk/react';

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
    const options ={
        method,
        headers : {
            "content-type" : "application/json"
        }
    };

    //ATTACH TOKEN
    if(token){
        options.headers.Authorization = `Bearer ${token}`;
    }
    if(body){
        options.body = JSON.stringify(body);
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    if(!res.ok){
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "API Error");

    }
    return res.json();

};

//use api
export const useApi = () => {
    const { getToken } = useAuth();
    const request = async (endpoint, method= "GET", body= null) => {
        const token = await getToken();
        return apiRequest(endpoint, method, body, token);
    }
    return { request };
};

