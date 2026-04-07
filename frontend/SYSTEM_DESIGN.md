# Frontend System Design Documentation

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Component Hierarchy](#component-hierarchy)
4. [Design Patterns](#design-patterns)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Routing Strategy](#routing-strategy)
8. [Error Handling](#error-handling)
9. [Performance Optimization](#performance-optimization)
10. [Type Safety](#type-safety)

---

## Architecture Overview

The frontend follows a **Layered Architecture** with clear separation of concerns:

```
┌─────────────────────────────────────┐
│      Presentation Layer (Components) │
│  ┌──────────┐  ┌──────────┐        │
│  │  App     │  │ Login    │        │
│  │ Register │  │ Dashboard│        │
│  └──────────┘  └──────────┘        │
└─────────────────────────────────────┘
           ↓ (uses)
┌─────────────────────────────────────┐
│      State Management Layer (Hooks)  │
│  ┌─────────────────────────────────┐│
│  │  useDashboardData Hook          ││
│  │  (Custom React Hook)            ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
           ↓ (calls)
┌─────────────────────────────────────┐
│      Service Layer                   │
│  ┌──────────┐  ┌──────────────────┐ │
│  │ UserApi  │  │ Axios Instance   │ │
│  │ Service  │  │ (ApiClient)      │ │
│  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────┘
           ↓ (communicates)
┌─────────────────────────────────────┐
│      Backend API (Express.js)        │
│  - Authentication Endpoints         │
│  - Protected Routes                 │
│  - Token Refresh Logic              │
└─────────────────────────────────────┘
```

---

## Project Structure

```
frontend/src/
├── App.tsx                      # Main app router (Class Component)
├── api/
│   └── axios.ts                # ApiClient class with interceptors
├── pages/
│   ├── Login.tsx               # Login page (Functional Component)
│   ├── Register.tsx            # Register page (Class Component)
│   └── Dashboard.tsx           # Dashboard page (Functional Component using Hook)
├── components/
│   ├── NotFoundPage.tsx        # 404 page (Class Component)
│   ├── ProtectedLayout.tsx     # Route guard wrapper (Class Component)
│   └── ProtectedRoute.tsx      # Route guard component (Class Component)
├── hooks/
│   └── useDashboardData.ts     # Custom hook for dashboard state
├── services/
│   └── userApiService.ts       # UserApiService class for API calls
├── index.css                   # Global styles
├── App.css                     # App-specific styles
└── main.tsx                    # React app entry point
```

---

## Component Hierarchy

### 1. **App.tsx (Class Component)**
- **Type**: Class-based component extending `React.Component`
- **Responsibility**: Root component managing router configuration
- **Structure**:
  ```
  App (Class)
  └── BrowserRouter
      └── AppRoutes (Functional Component)
          ├── Route: /register → <Register />
          ├── Route: / → <Login />
          └── Route: /dashboard → <Dashboard />
  ```
- **Key Pattern**: Separates routing logic into `AppRoutes` functional component for Fast Refresh compatibility while keeping main App as class component

---

### 2. **Login.tsx (Functional Component with Hooks)**
- **Type**: Functional component with `useState` and `useCallback`
- **State**: email, password, isLoading, error
- **Key Features**:
  - Form validation before submission
  - Axios error handling with fallback messages
  - Token storage in localStorage
  - Auto-redirect to /dashboard on success
- **Error Handling**:
  - Shows user-friendly error messages
  - Distinguishes between network errors and API errors
  - Clears error on input change

---

### 3. **Register.tsx (Class Component)**
- **Type**: Class-based component extending `React.Component`
- **State**: name, email, password, error, loading
- **Methods**:
  - `handleInputChange()`: Updates state for input fields
  - `handleRegister()`: Validates and submits registration
- **Key Features**:
  - Prevents form submission during loading
  - Displays user-friendly error messages
  - Input validation for required fields
  - Styled container with consistent theme

---

### 4. **Dashboard.tsx (Functional Component with Hook)**
- **Type**: Functional component consuming `useDashboardData` hook
- **Data Flow**: Hook → Component → Render
- **States Rendered**:
  - **Loading**: Shows loading spinner
  - **Error**: Shows error message with recovery instructions
  - **Success**: Displays user data from hook
- **Key Pattern**: Pure presentation component with logic abstracted to hook

---

### 5. **Protected Components (Class Components)**

#### **ProtectedLayout.tsx**
- Acts as a layout wrapper for protected routes
- Checks token existence before rendering Outlet
- Redirects to "/" if token is missing
- Integrates with React Router's `<Outlet />`

#### **ProtectedRoute.tsx**
- Guards individual routes from unauthorized access
- Accepts children via props
- Renders `<Navigate to="/" />` if token missing
- Can wrap any component that needs authentication

#### **NotFoundPage.tsx**
- Displays 404 error page
- Uses `PureComponent` for performance optimization
- Simple stateless UI

---

## Design Patterns

### 1. **Separation of Concerns**
- **Presentational Components**: Handle rendering logic (Login, Dashboard)
- **Smart Components**: Manage state and side effects (useDashboardData hook)
- **Service Layer**: Handle API communication (UserApiService)
- **Route Guards**: Protect routes from unauthorized access (ProtectedLayout, ProtectedRoute)

### 2. **Class-Based + Functional Hybrid Approach**
- **Class Components**: 
  - `App.tsx` (Router management)
  - `Register.tsx` (Form with state)
  - `NotFoundPage.tsx` (Pure component)
  - `ProtectedLayout.tsx` (Layout guard)
  - `ProtectedRoute.tsx` (Route guard)
- **Functional Components**:
  - `Login.tsx` (Simple form)
  - `Dashboard.tsx` (Pure presenter using hook)

### 3. **Custom Hooks Pattern**
- **useDashboardData**: Encapsulates dashboard data fetching logic
- Benefits:
  - Reusable logic across components
  - Easy testing
  - Clear separation of state management from rendering

### 4. **Dependency Injection**
- `UserApiService` accepts `apiClient` in constructor
- Allows easy mocking in tests
- Example:
  ```typescript
  constructor(apiClient: typeof apiInstance = apiInstance) {
    this.api = apiClient;
  }
  ```

### 5. **Token Refresh Pattern**
- **ApiClient** class automatically handles token refresh on 401
- Request interceptor adds Bearer token to all requests
- Response interceptor:
  - Detects 401 status
  - Calls `/auth/refresh` endpoint
  - Updates localStorage with new token
  - Retries original request
  - Redirects to "/" on final failure

---

## State Management

### 1. **Local Component State**
- **Login.tsx**: email, password, isLoading, error (useState)
- **Register.tsx**: name, email, password, error, loading (this.state)

### 2. **Hook-Based State**
- **useDashboardData.ts**: data, loading, error
  - Uses `useState` internally
  - Manages side effects with `useEffect`
  - Runs data fetch only once on mount (dependency array: [])

### 3. **localStorage**
- **Purpose**: Persists authentication token across page reloads
- **Key**: "accessToken"
- **Lifecycle**:
  - Set on successful login
  - Retrieved on app startup
  - Cleared on logout or 401

### 4. **No Global State Manager**
- Decided against Redux/Context for simplicity
- Token refresh handled at API layer (ApiClient)
- Each component manages its own UI state

---

## API Integration

### **ApiClient Class (axios.ts)**

**Architecture**: Encapsulates all HTTP communication logic

```typescript
export class ApiClient {
  - axiosInstance: AxiosInstance
  + setupRequestInterceptor(): void
  + setupResponseInterceptor(): void
  + _refreshAccessToken(): Promise
  + get client(): AxiosInstance
}
```

**Request Interceptor Flow**:
```
Request → Check localStorage for token → Add Authorization header → Send
```

**Response Interceptor Flow**:
```
Response (401) → Attempt refresh → Update token → Retry request → Success
Response (401) → Refresh fails → Clear token → Redirect to "/" → Redirect
Response (other) → Pass through or reject
```

### **UserApiService Class (userApiService.ts)**

**Architecture**: Service layer for user-related API calls

```typescript
export class UserApiService {
  - api: typeof apiInstance
  + getAccessToken(): string | null
  + getProfile(): Promise<string>
}
```

**Usage in Dashboard**:
```
useDashboardData Hook → fetchUserProfile() → UserApiService.getProfile()
```

---

## Routing Strategy

### **Routes Configuration**

| Path | Component | Type | Auth Required |
|------|-----------|------|---------------|
| `/` | Login | Functional | ❌ No |
| `/register` | Register | Class | ❌ No |
| `/dashboard` | Dashboard | Functional | ✅ Yes |

### **Route Protection Mechanism**

1. **Implicit Protection** (useDashboardData Hook):
   - Dashboard component uses hook that checks token
   - Displays error if token missing
   - No hard redirect

2. **Explicit Protection** (ProtectedLayout/Route):
   - Available for wrapping routes
   - Performs redirect if token missing
   - Not currently used in active routes

### **Navigation Flow**

```
User Access App
    ↓
Check App.tsx routes
    ↓
Public Routes (/register, /)
    ↓
Functional routes (Login, Register)
    ↓
Protected Routes (/dashboard)
    ↓
Check token in useDashboardData
    ↓
No token? → Show error
Has token? → Fetch data → Render dashboard
```

---

## Error Handling

### **Error Handling Layers**

#### **1. API Layer (ApiClient)**
```typescript
setupResponseInterceptor() {
  - 401 Unauthorized → Attempt refresh
  - Refresh failure → Clear token + Redirect
  - Other errors → Reject promise
}
```

#### **2. Service Layer (UserApiService)**
```typescript
getProfile() {
  try {
    - Fetch from /user/me
    - Return message string
  } catch {
    - 401 → Clear token + Throw
    - Other → Throw generic error
  }
}
```

#### **3. Hook Layer (useDashboardData)**
```typescript
useEffect() {
  - No token → Set error state
  - API success → Set data
  - API failure → Catch error + Set state
  - Finally → Reset loading state
}
```

#### **4. Component Layer**
```typescript
Login.tsx:
- Validates input → Shows error
- API error → Shows user message
- Success → Redirect

Register.tsx:
- Validates input → Shows error
- Duplicate email → Shows API message
- Success → Redirect

Dashboard.tsx:
- Loading state → Show spinner
- Error state → Show message + instructions
- Success → Show user data
```

### **Error Message Types**

| Error Type | Where Caught | User Sees |
|-----------|-------------|-----------|
| Network error | ApiClient | "Connection failed: [error]" |
| 401 Unauthorized | ApiClient/Service | "Unauthorized access. Please log in again." |
| Validation error | Component | "Please enter both email and password." |
| API error | ApiClient/Service | Backend error message |
| Missing token | useDashboardData | "Authentication token is missing." |

---

## Performance Optimization

### **1. Component Optimization**

#### **PureComponent Usage**
- `NotFoundPage extends PureComponent`
- `ProtectedLayout extends PureComponent`
- `ProtectedRoute extends PureComponent`
- **Benefit**: Automatic shallow prop/state comparison prevents unnecessary re-renders

#### **useCallback for Function Stability**
- `Login.tsx`:
  - `validateForm = useCallback(...)`
  - `handleLogin = useCallback(...)`
- **Benefit**: Prevents child component re-renders from function reference changes

#### **Dependency Arrays**
- `useDashboardData`: `useEffect(..., [])` - Runs once on mount
- `Login.validateForm`: `useCallback(..., [email, password])` - Recreates when inputs change

### **2. API Optimization**

#### **Token Refresh Pattern**
- Single refresh call on 401
- Request retried with new token
- Prevents multiple unnecessary API calls

#### **Request Interception**
- Token added to all requests automatically
- No need to manually pass token in component

### **3. Bundle Optimization**

#### **Code Splitting Ready**
- Routes structure allows for lazy loading (if needed)
- `React.lazy()` can be applied to page components

### **4. localStorage Caching**
- Token persisted in browser
- Reduces login frequency
- Auto-refresh on token expiry

---

## Type Safety

### **TypeScript Configuration**
- Strict mode enabled (tsconfig.json)
- No `any` types in critical paths
- Interface definitions for all API responses

### **Interface Definitions**

#### **API Response Types**
```typescript
export interface UserProfileResponse {
    message: string;
}

export interface DashboardState {
    data: string | null;
    loading: boolean;
    error: string | null;
}
```

#### **Component Props**
```typescript
interface RegisterState {
  name: string;
  email: string;
  password: string;
  error: string;
  loading: boolean;
}

interface ProtectedRouteProps {
  children?: React.ReactNode;
}
```

#### **Function Return Types**
```typescript
validateForm = (): boolean => {...}
handleRegister = async (): Promise<void> => {...}
getProfile = async (): Promise<string> => {...}
```

### **Generic Types**
```typescript
// API responses
api.post<{ accessToken?: string }>("/auth/login", ...)
api.get<UserProfileResponse>("/user/me", ...)

// Hook state
useState<DashboardState>({...})
```

---

## Communication Flow Diagram

### **Login Flow**
```
1. User enters email/password in Login component
   ↓
2. handleLogin() validates form
   ↓
3. Calls api.post("/auth/login", {email, password})
   ↓
4. ApiClient request interceptor adds Bearer token (if exists)
   ↓
5. Backend returns {accessToken, refreshToken}
   ↓
6. Component stores accessToken in localStorage
   ↓
7. Redirects to /dashboard
   ↓
8. Dashboard component mounts
```

### **Dashboard Data Load**
```
1. Dashboard component mounts
   ↓
2. useDashboardData hook initializes
   ↓
3. useEffect retrieves token from localStorage
   ↓
4. Calls api.get("/user/me")
   ↓
5. ApiClient request interceptor adds Authorization header
   ↓
6. Backend returns {message: "..."}
   ↓
7. Hook setState with message data
   ↓
8. Component re-renders with data
```

### **Token Refresh Flow**
```
1. User makes API request
   ↓
2. Token expired (401 response)
   ↓
3. ApiClient response interceptor catches 401
   ↓
4. Calls api.post("/auth/refresh")
   ↓
5. Backend validates refresh token, returns new accessToken
   ↓
6. ApiClient stores in localStorage
   ↓
7. Retries original request with new token
   ↓
8. Response succeeds and returns to component
```

---

## Testing Strategy

### **Unit Tests**
- Login component validation logic
- Register component input handling
- useDashboardData hook state transitions
- ApiClient interceptor logic
- UserApiService error handling

### **Integration Tests**
- Login flow (form → API → redirect)
- Register flow (validation → API → redirect)
- Dashboard data loading (hook → API → render)
- Token refresh on 401

### **E2E Tests**
- User registration journey
- User login journey
- Protected route access
- Token expiry and refresh

---

## Security Considerations

✅ **Implemented**:
- Access token stored in localStorage (accessible to JavaScript)
- Bearer token sent in Authorization header
- Token refresh on 401
- Clear token on logout
- HTTPS ready (secure flag for cookies when implemented)

⚠️ **Future Improvements**:
- Implement HttpOnly cookies for refresh token
- CSRF token for state-changing requests
- CSP headers
- XSS protection measures
- Rate limiting on login attempts

---

## Conclusion

The frontend architecture demonstrates:
- ✅ Clear separation of concerns (Components → Hooks → Services → API)
- ✅ Mixed class/functional component approach for flexibility
- ✅ Robust error handling at multiple layers
- ✅ Type-safe TypeScript implementation
- ✅ Performance optimization patterns
- ✅ Scalable routing structure
- ✅ Secure token management with auto-refresh
- ✅ Comprehensive commented code for maintainability

**Commented code preserved throughout** for historical reference and educational purposes.
