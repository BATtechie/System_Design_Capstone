// import { useState } from "react";
// import axios from "axios";
// import api from "../api/axios";

// const Login = () => {
//   // State for inputs
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
  
//   // New states for UX and robustness
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(""); // Holds validation or API error messages

//   /**
//    * Handles client-side validation check
//    * @returns {boolean} True if fields are valid, false otherwise.
//    */
//   const validateForm = () => {
//     if (!email || !password) {
//       setError("Please enter both email and password.");
//       return false;
//     }
//     // You can add regex checks here for email format: 
//     // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     // if (!emailRegex.test(email)) { ... }
//     setError(""); // Clear previous errors if basic validation passes
//     return true;
//   };

//   const handleLogin = async () => {
//     // 1. Client-side Validation Check
//     if (!validateForm()) {
//       return; // Stop execution if validation fails
//     }

//     setIsLoading(true);
//     setError(""); // Clear any previous API errors before attempting login

//     try {
//       const res = await api.post("/auth/login", { email, password });
      
//       // Success handling
//       const accessToken = res.data?.accessToken; 
//       if (accessToken) {
//         localStorage.setItem("accessToken", accessToken);
//         window.location.href = "/dashboard";
//       } else {
//          setError("Login successful but no access token received.");
//       }

//     } catch (err: unknown) {
//       // 2. Robust Error Handling
//       console.error("Login attempt failed:", err);
      
//       let errorMessage = "An unexpected login error occurred. Please try again.";
      
//       // Try to extract a specific message from the API response body
//       if (axios.isAxiosError(err)) {
//         const apiMessage = err.response?.data?.message;
//         if (typeof apiMessage === "string") {
//           errorMessage = apiMessage;
//         } else if (err.message) {
//           // Fallback for Axios/Network errors
//           errorMessage = `Connection failed: ${err.message}`;
//         }
//       }

//       setError(errorMessage); // Set the specific error message in state

//     } finally {
//       // 3. Ensures loading state is always reset, regardless of success or failure
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="login-container">
//       <h2>Login</h2>
//       {/* Display Error/Validation Message */}
//       {error && <p style={{ color: 'red' }} className="error-message">{error}</p>}
      
//       {/* Use a semantic form tag */}
//       <form onSubmit={(e) => { 
//         e.preventDefault(); // Prevent default form submission behavior
//         handleLogin(); 
//       }}>
        
//         {/* Labels and Accessibility improve UX */}
//         <label htmlFor="email">Email</label>
//         <input
//           id="email"
//           type="email"
//           placeholder="Enter your email address"
//           value={email}
//           onChange={(e) => { setEmail(e.target.value); setError(""); }} // Clear error on change
//           required
//         />

//         <label htmlFor="password">Password</label>
//         <input
//           id="password"
//           type="password"
//           placeholder="Enter your password"
//           value={password}
//           onChange={(e) => { setPassword(e.target.value); setError(""); }} // Clear error on change
//           required
//         />

//         {/* Disabled button and Loading State */}
//         <button 
//           onClick={(e) => { e.preventDefault(); handleLogin(); }}
//           disabled={isLoading}
//         >
//           {isLoading ? "Logging in..." : "Login"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Login;
// import { useState } from "react";
// import axios from "axios";
// import api  from "../api/axios";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const validateForm = () => {
//     if (!email || !password) {
//       setError("Please enter both email and password.");
//       return false;
//     }
//     setError("");
//     return true;
//   };

//   const handleLogin = async () => {
//     if (!validateForm()) return;

//     setIsLoading(true);
//     setError("");

//     try {
//       const res = await api.post("/auth/login", { email, password });

//       const accessToken = res.data?.accessToken;

//       if (!accessToken) {
//         throw new Error("No access token received");
//       }

//       // ✅ store token
//       localStorage.setItem("accessToken", accessToken);

//       // ✅ redirect (cleaner way)
//       window.location.replace("/dashboard");

//     } catch (err: unknown) {
//       console.error("Login failed:", err);

//       let errorMessage = "Something went wrong. Please try again.";

//       if (axios.isAxiosError(err)) {
//         errorMessage =
//           err.response?.data?.error ||
//           err.response?.data?.message ||
//           err.message;
//       } else if (err instanceof Error) {
//         errorMessage = err.message;
//       }

//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div
//       style={{
//         padding: "40px",
//         maxWidth: "400px",
//         margin: "auto",
//         color: "white",
//       }}
//     >
//       <h2>Login</h2>

//       {error && (
//         <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
//       )}

//       {/* ✅ ONLY form handles submit (no double trigger) */}
//       <form
//         onSubmit={(e) => {
//           e.preventDefault();
//           handleLogin();
//         }}
//       >
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => {
//             setEmail(e.target.value);
//             setError("");
//           }}
//           style={{ display: "block", marginBottom: "10px", width: "100%" }}
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => {
//             setPassword(e.target.value);
//             setError("");
//           }}
//           style={{ display: "block", marginBottom: "10px", width: "100%" }}
//         />

//         <button
//           type="submit"
//           disabled={isLoading}
//           style={{ width: "100%" }}
//         >
//           {isLoading ? "Logging in..." : "Login"}
//         </button>
//         <p>
//   Don't have an account?{" "}
//   <a href="/register">Register</a>
// </p>
//       </form>
//     </div>
//   );
// };

// export default Login;


// <------------------------------------------------------------------------------------------------------>


import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import api from "../api/axios";

/**
 * Login component with comprehensive form state and error handling.
 */
const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validates the form state and returns boolean status.
   */
  const validateForm = useCallback((): boolean => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return false;
    }
    setError(null);
    return true;
  }, [email, password]);

  /**
   * Handles the core login authentication process.
   */
  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ accessToken?: string }>(
        "/auth/login",
        { email, password }
      );

      const token = response.data?.accessToken;

      if (!token) {
        throw new Error("No access token received");
      }

      localStorage.setItem("accessToken", token);
      window.location.replace("/dashboard");
    } catch (err: unknown) {
      let errorMessage: string;

      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
        errorMessage =
          (axiosErr.response?.data?.error as string) ||
          (axiosErr.response?.data?.message as string) ||
          axiosErr.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = "An unknown error occurred.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, validateForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto", color: "white" }}>
      <h2>Login</h2>

      {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
          style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px" }}
        />

        <button
          type="submit"
          disabled={isLoading}
          style={{ width: "100%", padding: "10px", background: "#333" }}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <p style={{ marginTop: "20px" }}>
          Don't have an account?{" "}
          <a href="/register" style={{ color: "#ccc" }}>
            Register
          </a>
        </p>
      </form>
    </div>
  );
};

export default Login;
