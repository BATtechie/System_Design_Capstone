// import { Navigate, Outlet } from "react-router-dom";

// const ProtectedLayout = () => {
//   const token = localStorage.getItem("accessToken");

//   if (!token) {
//     return <Navigate to="/" replace />;
//   }

//   return <Outlet />;
// };

// export default ProtectedLayout;
// <------------------------------------------------------------------------------>

import React, { PureComponent } from 'react';
import { Navigate, Outlet } from "react-router-dom";

// --- Type Guarding & Interface Definition ---
/** Defines the required props for the layout component. */
type ProtectedLayoutProps = object;

/** 
 * Component guarding routes. Checks for a valid authentication token 
 * and redirects unauthenticated users to the root path.
 * Utilizes PureComponent for automatic performance optimization.
 */
class ProtectedLayout extends PureComponent<ProtectedLayoutProps> {
  public render(): React.ReactNode {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      return <Navigate to="/" replace />;
    }

    return <Outlet />;
  }
}

export default ProtectedLayout;
