// import { useEffect, useState } from "react";
// import axios from "axios";
// import api from "../api/axios";

// const Dashboard = () => {
//   // State to hold success data (message)
//   const [data, setData] = useState<string | null>(null); 
//   // State for loading feedback
//   const [loading, setLoading] = useState<boolean>(true);
//   // State to handle API failure
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true); // Start loading immediately
        
//         const token = localStorage.getItem("accessToken");
//         if (!token) {
//             throw new Error("Authentication token missing.");
//         }

//         // --- API CALL ---
//         const res = await api.get("/user/me", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
        
//         setData(res.data.message); // Success: Set data
//       } catch (err: unknown) {
//         // Handle all errors (network, 401 unauthorized, custom throw above)
//         console.error("Dashboard fetch error:", err);
//         setError("Failed to load user profile. Please check your connection or try again.");
//         setData(null);

//         // Optionally clear the token/redirect if a specific auth error occurs
//         if (axios.isAxiosError(err) && err.response?.status === 401) {
//           localStorage.removeItem("accessToken");
//           // You might want to redirect manually here: window.history.pushState({}, "", "/login");
//         }

//       } finally {
//         // Always run this when the try/catch block finishes
//         setLoading(false); 
//       }
//     };
//     fetchData();
//   }, []); // Dependency array is correct: run once

//   // --- Conditional Rendering (UX Improvement) ---
//   if (loading) {
//     return <h2 className="text-blue-600">Loading dashboard data...</h2>;
//   }

//   if (error) {
//     return <h2 className="text-red-600">🛑 {error}</h2>;
//   }

//   // Success state: Render the fetched message
//   return <h2 className="text-green-600">{data || "Welcome back!"}</h2>;
// };

// export default Dashboard;

// <----------------------------------------------------------------------------------------------------->

// src/components/Dashboard.tsx

import React from "react";
import { useDashboardData } from "../hooks/useDashboardData";

/**
 * Dashboard Component: A pure presentation layer that consumes state via a custom hook.
 */
const Dashboard: React.FC = () => {
    // Use the encapsulated logic to get all necessary states
    const { data, loading, error } = useDashboardData();

    // --- Conditional Rendering Logic ---
    if (loading) {
        return <div className="p-8 bg-yellow-100 text-blue-600 rounded-lg shadow">
            <h2 className="text-xl font-semibold">🔄 Loading dashboard data...</h2>
        </div>;
    }

    if (error) {
        return <div className="p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow">
            <h2 className="text-xl font-semibold">🛑 Error: {error}</h2>
            <p className="mt-2 text-sm">Please check your internet connection or try logging in again.</p>
        </div>;
    }

    // Success state: Render the fetched message
    return <div className="p-8 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow">
        <h2 className="text-xl font-semibold">✅ Welcome Back!</h2>
        <p className="mt-2">{data || "No specific message found."}</p>
    </div>;
};

export default Dashboard;
