// const NotFoundPage = () => {
//   return (
//     <div style={{ padding: "2rem", textAlign: "center" }}>
//       <h1>404</h1>
//       <p>Page not found.</p>
//     </div>
//   );
// };

// export default NotFoundPage;

// <-------------------------------------------------------------------------->---------------------->
import React, { PureComponent } from 'react';

// --- Type Guarding & Interface Definition ---
/** Defines the required structure for component props. */
type NotFoundProps = object;


/** 
 * Component representing the HTTP 404 Not Found page.
 * Utilizes PureComponent for automatic performance optimization.
 */
class NotFoundPage extends PureComponent<NotFoundProps> {
  /**
   * Renders the 404 UI structure. This method is optimized and stateless.
   * @returns {JSX.Element} The rendered component tree.
   */
  public render(): React.ReactNode {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>404</h1>
        <p>Page not found.</p>
      </div>
    );
  }
}

export default NotFoundPage;
