// import { useState } from "react";
// import type { ChangeEvent } from "react";
// import axios from "axios";
// import api from "../api/axios";

// const Register: React.FC = () => {
//   const [name, setName] = useState<string>("");
//   const [email, setEmail] = useState<string>("");
//   const [password, setPassword] = useState<string>("");
//   const [error, setError] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);

//   const handleRegister = async () => {
//     setError("");

//     if (!name || !email || !password) {
//       setError("Please fill out all required fields.");
//       return;
//     }

//     setLoading(true);
//     try {
//       await api.post("/auth/register", {
//         email,
//         password,
//         name,
//       });
//       alert("Account created ✅");
//       window.location.href = "/";
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         const apiMessage =
//           error.response?.data?.message ||
//           error.response?.data?.error ||
//           "Registration failed.";
//         setError(apiMessage);
//       } else {
//         setError("An unexpected error occurred during registration.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ color: "white", padding: "40px", maxWidth: "400px", margin: "50px auto", background: "#2c3e50", borderRadius: "10px" }}>
//       <h2 style={{ borderBottom: "1px solid #4a6987", paddingBottom: "10px" }}>Register</h2>
//       {error && <p style={{ color: "red", marginBottom: "20px" }}>⚠️ {error}</p>}

//       <div style={styles.inputGroup}>
//         <input
//           placeholder="Name"
//           onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
//           style={styles.input}
//         />
//       </div>

//       <div style={styles.inputGroup}>
//         <input
//           placeholder="Email"
//           onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
//           type="email"
//           style={styles.input}
//         />
//       </div>

//       <div style={styles.inputGroup}>
//         <input
//           placeholder="Password"
//           onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
//           type="password"
//           style={styles.input}
//         />
//       </div>

//       <button
//         onClick={handleRegister}
//         disabled={loading}
//         style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
//       >
//         {loading ? "Processing..." : "Register"}
//       </button>
//     </div>
//   );
// };

// export default Register;

// const styles = {
//   inputGroup: { marginBottom: "20px" },
//   input: {
//     width: "100%",
//     padding: "10px",
//     border: "1px solid #4a6987",
//     borderRadius: "5px",
//     backgroundColor: "#34495e",
//     color: "white",
//   },
//   button: {
//     width: "100%",
//     padding: "12px",
//     border: "none",
//     borderRadius: "5px",
//     backgroundColor: "#3498db",
//     color: "white",
//     cursor: "pointer",
//     fontSize: "16px",
//   },
// };



// <----------------------------------------------------------------------------->---------------------->

import React, { Component } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";
import api from "../api/axios";

// --- Interface Definitions for Type Safety ---
interface RegisterState {
  name: string;
  email: string;
  password: string;
  error: string;
  loading: boolean;
}

/**
 * Register Component Class
 * Manages registration logic, state, and UI rendering using ES6 class structure.
 */
class RegisterComponent extends Component<object, RegisterState> {
  // Initialize state using this.state for idiomatic ES6 class state management
  state: RegisterState = {
    name: "",
    email: "",
    password: "",
    error: "",
    loading: false,
  };

  /**
   * Handles changes in form input fields and updates local component state.
   * @param e The change event from the target input element.
   * @param fieldName The name of the field being updated (e.g., 'name', 'email').
   */
  handleInputChange = (e: ChangeEvent<HTMLInputElement>, fieldName: "name" | "email" | "password") => {
    const value = e.target.value;

    if (fieldName === "name") {
      this.setState({ name: value });
      return;
    }

    if (fieldName === "email") {
      this.setState({ email: value });
      return;
    }

    this.setState({ password: value });
  };

  /**
   * Main asynchronous function to handle the registration API call.
   * Implements loading state transitions and robust error handling.
   */
  handleRegister = async () => {
    const { name, email, password } = this.state;
    this.setState({ error: "" });

    if (!name || !email || !password) {
      this.setState({ error: "Please fill out all required fields." });
      return;
    }

    try {
      this.setState({ loading: true });

      await api.post("/auth/register", { email, password, name });

      alert("Account created ✅");
      window.location.href = "/";
    } catch (error) {
      let errorMessage: string;

      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.message || 
                           error.response?.data?.error || "Registration failed.";
        errorMessage = apiMessage;
      } else {
        errorMessage = "An unexpected error occurred during registration.";
      }
      this.setState({ error: errorMessage });
    } finally {
      this.setState({ loading: false });
    }
  };

  // --- Rendering Logic ---
  render() {
    const { name, email, password, error, loading } = this.state;

    return (
      <div style={styles.container}>
        <h2>Register</h2>
        {error && <p style={styles.errorText}>⚠️ {error}</p>}
        
        <div style={styles.inputGroup}>
          <input
            placeholder="Name"
            onChange={(e: ChangeEvent<HTMLInputElement>) => this.handleInputChange(e, "name")}
            style={styles.input}
            value={name} 
            disabled={loading}
          />
        </div>
        
        <div style={styles.inputGroup}>
          <input
            placeholder="Email"
            onChange={(e: ChangeEvent<HTMLInputElement>) => this.handleInputChange(e, "email")}
            type="email"
            style={styles.input}
            value={email} 
            disabled={loading}
          />
        </div>
        
        <div style={styles.inputGroup}>
          <input
            placeholder="Password"
            onChange={(e: ChangeEvent<HTMLInputElement>) => this.handleInputChange(e, "password")}
            type="password"
            style={styles.input}
            value={password} 
            disabled={loading}
          />
        </div>
        
        <button
          onClick={this.handleRegister}
          disabled={loading}
          style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Processing..." : "Register"}
        </button>
      </div>
    );
  }
}

const Register: React.FC = () => <RegisterComponent />;
export default Register;

// --- Optimized Styles Object (Clean Naming) ---
const styles = {
  container: {
    color: "white", 
    padding: "40px", 
    maxWidth: "400px", 
    margin: "50px auto", 
    background: "#2c3e50", 
    borderRadius: "10px"
  },
  errorText: { 
    color: "red", 
    marginBottom: "20px" 
  },
  inputGroup: { marginBottom: "20px" },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #4a6987",
    borderRadius: "5px",
    backgroundColor: "#34495e",
    color: "white",
  },
  button: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#3498db",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
  },
};

// Note: The original component name was 'Register', but using the class structure 
// requires exporting the class instance or wrapping it in a functional default export.
// We retain the function signature for compatibility but use the Class Component internally.
const RegisterWrapper: React.FC = () => <RegisterComponent />;

export { RegisterWrapper as Default }; 
