// import React from 'react'; // Import React for component typing
// import { Navigate } from "react-router-dom";

// // Define the functional component using standard typing
// const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
//   // Note: For production, you might want to check if localStorage is available 
//   // before calling it, but for modern web apps, this check is usually fine.
//   const token = localStorage.getItem("accessToken");

//   if (!token) {
//     // Redirects the user if no token is found in local storage
//     return <Navigate to="/" />;
//   }

//   // If the token exists, render the protected content
//   return children;
// };

// export default ProtectedRoute;
// <------------------------------------------------------------------------------>


import React, { PureComponent } from 'react';
import { Navigate } from "react-router-dom";

// --- Type Guarding & Interface Definition ---
/** Defines the required structure for component props (receiving children). */
interface ProtectedRouteProps {
  children?: React.ReactNode;
}

/** 
 * Component that acts as a route guard, ensuring access only if an authentication token exists.
 * Utilizes PureComponent for automatic performance optimization and receives protected content via its children prop.
 */
class ProtectedRoute extends PureComponent<ProtectedRouteProps> {

  /**
   * Renders the Route Guard logic: checks for token presence before rendering protected content.
   */
  public render(): React.ReactNode {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      // Token missing: Redirects the user to the root path, maintaining router context.
      return <Navigate to="/" />;
    }

    // Token found: Render the protected content passed via props.
    return this.props.children;
  }
}

export default ProtectedRoute;
