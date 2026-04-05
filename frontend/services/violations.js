import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
});

// Violations
export async function getViolations(){
    const response = await API.get("/violations");
    return response.data;
}

// Analytics
export async function getAnalytics(){
    const response = await API.get("/analytics");
    return response.data;
}

// Reports
export const getReports = async (from, to, violation) => {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    if (violation) params.violation = violation;

    const response = await API.get("/reports", { params });
    return response.data;
}