# Frontend Architecture: Routing & State Management

## 🗺️ Routing Architecture

### **Route Configuration (App.tsx)**

```
App (Class Component)
├── BrowserRouter
│   └── AppRoutes (Functional Component)
│       ├── Route path="/register" → <Register />
│       ├── Route path="/" → <Login />
│       └── Route path="/dashboard" → <Dashboard />
```

### **Active Routes**

| Path | Component | Auth Required | Component Type | Rendering |
|------|-----------|---|---|---|
| `/` | Login | ❌ No | Functional | Email/password form |
| `/register` | Register | ❌ No | Class | Name/email/password form |
| `/dashboard` | Dashboard | ✅ Yes | Functional + Hook | User profile display |

### **Route Guards (Not Currently Active)**

These are available for future use:

```tsx
// Pattern 1: Layout-based protection
<Route element={<ProtectedLayout />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>

// Pattern 2: Component-based protection
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

**How They Work**:
1. Check localStorage for "accessToken"
2. If missing → Redirect to "/"
3. If found → Render protected content

---

## 🔄 State Management Overview

### **Architecture Decision**
- ✅ **No Global State Manager** (Redux, Context API)
- ✅ **Local Component State** (useState, this.state)
- ✅ **Custom Hooks** (useDashboardData)
- ✅ **Service Layer** (UserApiService)
- ✅ **Persistent Storage** (localStorage for token)

### **Why This Approach?**
1. Simple project scope
2. Easy to test each layer
3. Clear data flow
4. Token refresh at API layer
5. No prop drilling issues
6. Scalable for future additions

---

## 📊 State Management by Component

### **1. Login Component**
```typescript
State (Local):
- email: string
- password: string
- isLoading: boolean
- error: string | null

State Flow:
User Input → useState setter → Validation → API Call → 
Success: localStorage + Redirect
Failure: Display error message
```

### **2. Register Component**
```typescript
State (this.state):
- name: string
- email: string
- password: string
- error: string
- loading: boolean

State Flow:
User Input → handleInputChange → setState → 
Validation → API Call → 
Success: Alert + Redirect
Failure: Display error
```

### **3. Dashboard Component**
```typescript
State (Via useDashboardData Hook):
- data: string | null
- loading: boolean
- error: string | null

State Flow:
Component Mount → Hook useEffect → 
Check Token → Fetch Profile → 
setState → Component Re-render
```

### **4. useDashboardData Hook**
```typescript
Internal State:
- state: DashboardState {data, loading, error}

State Transitions:
Initial: {data: null, loading: true, error: null}
  ↓
Loading: {data: null, loading: true, error: null}
  ↓
Success: {data: "message", loading: false, error: null}
  ↓
Error: {data: null, loading: false, error: "message"}
```

---

## 🔐 Authentication State

### **Token Storage**
```typescript
localStorage {
  accessToken: "eyJhbGc..." // 15-minute expiry
  // refreshToken: stored in secure cookie (backend)
}
```

### **Token Lifecycle**

```
1. User Logs In
   POST /auth/login → Backend
   ↓
   Returns: {accessToken, refreshToken}
   ↓
   Frontend: localStorage.setItem("accessToken", token)
   ↓
   Redirect to /dashboard

2. User Makes Request
   GET /user/me
   ↓
   ApiClient request interceptor adds header:
   Authorization: Bearer {accessToken}
   ↓
   Backend validates token
   ↓
   Success → Return data
   Expired (401) → See step 3

3. Token Refresh (Auto)
   Response: 401 Unauthorized
   ↓
   ApiClient response interceptor catches
   ↓
   POST /auth/refresh (with refresh token)
   ↓
   Returns: {accessToken}
   ↓
   localStorage.setItem("accessToken", newToken)
   ↓
   Retry original request
   ↓
   Success → Return data
   Failure → Clear token + Redirect to /

4. User Logs Out
   DELETE /auth/logout
   ↓
   localStorage.removeItem("accessToken")
   ↓
   Redirect to /
```

---

## 📈 Data Flow Diagrams

### **Complete Authentication Flow**

```
┌─────────────────────────────────────────────────────────┐
│                    USER ACTION                          │
│  (Enter email/password on Login page)                  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│           LOGIN COMPONENT (Functional)                  │
│  - Validates form (email, password not empty)          │
│  - Calls api.post("/auth/login", credentials)          │
│  - Handles error states                                │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│         API CLIENT (ApiClient Class)                    │
│  Request Interceptor:                                  │
│  - Gets token from localStorage                        │
│  - Adds Authorization header if token exists           │
│  - Forwards request to backend                         │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              BACKEND (Express.js)                       │
│  POST /auth/login                                      │
│  - Validates credentials                              │
│  - Generates access + refresh tokens                  │
│  - Returns {accessToken, refreshToken}                │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│         API CLIENT (Response Interceptor)               │
│  - Checks response status (200 OK)                     │
│  - Returns data to component                           │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│           LOGIN COMPONENT                              │
│  - Extracts accessToken from response                  │
│  - localStorage.setItem("accessToken", token)          │
│  - Calls window.location.replace("/dashboard")         │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│        DASHBOARD COMPONENT (Functional)                │
│  - Mounts and initializes useDashboardData hook        │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│         useDashboardData HOOK                           │
│  - useEffect on mount                                  │
│  - Retrieves token: localStorage.getItem("accessToken")│
│  - Calls fetchUserProfile(token)                       │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│       UserApiService.getProfile()                       │
│  - Checks for token existence                          │
│  - Calls api.get("/user/me")                           │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│         API CLIENT (Request Interceptor)                │
│  - Adds Authorization: Bearer {token}                   │
│  - Sends to backend                                    │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              BACKEND                                    │
│  GET /user/me                                          │
│  - Validates token                                     │
│  - Returns {message: "Welcome..."}                     │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│         API CLIENT (Response Interceptor)               │
│  - Checks response status (200 OK)                     │
│  - Returns data to hook                                │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│         useDashboardData HOOK                           │
│  - setState({data: message, loading: false})           │
│  - Hook returns state to component                     │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│        DASHBOARD COMPONENT                             │
│  - Re-renders with data from hook                      │
│  - Displays success message                            │
└─────────────────────────────────────────────────────────┘
```

### **Token Refresh Flow**

```
Component makes API request
         │
         ▼
API Client Request Interceptor
├─ Get token from localStorage
├─ Add Authorization header
└─ Send request
         │
         ▼
Backend validates token
         │
    ┌────┴────┐
    │          │
    ▼          ▼
 Valid      Expired (401)
    │          │
    ▼          ▼
 Return    Response Interceptor
 Data      catches 401
    │          │
    └──────┬───┘
           │
           ▼
      POST /auth/refresh
           │
      ┌────┴────┐
      │          │
      ▼          ▼
  Success     Failure
      │          │
      ▼          ▼
  New Token   Clear token
      │          │
      ▼          ▼
  Update    Redirect to /
localStorage
      │
      ▼
  Retry original request
      │
      ▼
  Return to component
```

---

## 🎯 State Transitions

### **Login Component State Machine**

```
┌─────────────────────┐
│   INITIAL STATE     │
│ email: ""           │
│ password: ""        │
│ isLoading: false    │
│ error: null         │
└──────────┬──────────┘
           │
     User Input
           │
           ▼
┌─────────────────────┐
│   INPUT STATE       │
│ email: "..."        │
│ password: "..."     │
│ isLoading: false    │
│ error: null         │
└──────────┬──────────┘
           │
     Form Submit
           │
           ▼
┌─────────────────────┐
│   LOADING STATE     │
│ email: "..."        │
│ password: "..."     │
│ isLoading: true     │
│ error: null         │
└──────────┬──────────┘
           │
      API Call
           │
      ┌────┴────┐
      │          │
      ▼          ▼
   Success    Failure
      │          │
      ▼          ▼
  Redirect   ERROR STATE
             error: "msg"
             isLoading: false
```

### **Dashboard Hook State Machine**

```
┌──────────────────────────────┐
│   INITIAL STATE              │
│ data: null                   │
│ loading: true                │
│ error: null                  │
└──────────────┬───────────────┘
               │
        useEffect runs
               │
        ┌──────┴──────┐
        │             │
     Token?       No Token
        │             │
        ▼             ▼
     Check      ERROR STATE
               error: "missing token"
               loading: false
               │
        ┌──────┴──────┐
        │             │
     Fetch        API Success
     Data              │
        │              ▼
        │         SUCCESS STATE
        │         data: "message"
        │         loading: false
        │         error: null
        │
     API Error
        │
        ▼
   ERROR STATE
   error: "failed..."
   loading: false
```

---

## 🔗 Service Layer Interaction

### **UserApiService Usage Pattern**

```typescript
// In useDashboardData hook
const service = new UserApiService(); // Dependency injection
const profile = await service.getProfile(); // Throws or returns string

// Error handling
try {
  const message = await service.getProfile();
  setState({data: message, loading: false, error: null});
} catch (err) {
  setState({data: null, loading: false, error: err.message});
}
```

### **ApiClient Usage Pattern**

```typescript
// ApiClient exports singleton instance
export default apiService.client;

// Usage in components
import api from "../api/axios";
const response = await api.get("/user/me");

// Interceptors run automatically:
// 1. Request interceptor adds Authorization header
// 2. Response interceptor handles 401
```

---

## 📋 Component Responsibility Matrix

| Component | State | API Calls | Routing | Rendering |
|-----------|-------|-----------|---------|-----------|
| App | None | None | ✅ Defines | App shell |
| Login | ✅ Local | ✅ Direct | Navigate | Form |
| Register | ✅ Local | ✅ Direct | Navigate | Form |
| Dashboard | Hook | Hook | No | View |
| useDashboardData | ✅ Manages | Hook | No | N/A |
| UserApiService | None | ✅ Methods | No | N/A |
| ApiClient | Interceptors | ✅ Core | No | N/A |

---

## 🚀 Scaling Strategy

### **Current State**: ✅ Perfect for MVP
- Single-page app with 3 routes
- Local component state sufficient
- No shared state between components
- Token refresh at API layer

### **When to Add Context API**:
```
If: Shared state across 3+ components
Then: Create AuthContext for {token, user, isAuth}
```

### **When to Add Redux**:
```
If: Complex state with time-travel debugging needed
Then: Redux with auth, ui, data slices
```

### **When to Add Service Worker**:
```
If: Offline functionality needed
Then: Cache API responses, queue requests
```

---

## ✅ Verification Checklist

✅ All routes properly configured  
✅ All state management layers working  
✅ Token refresh automatic  
✅ Error handling comprehensive  
✅ No state conflicts  
✅ Props drilling minimal  
✅ Data flow unidirectional  
✅ API calls centralized  
✅ localStorage used appropriately  
✅ Components loosely coupled  

---

**Architecture Type**: Layered with Component + Hook + Service Pattern  
**State Management**: Local + Custom Hooks  
**API Pattern**: ApiClient with Interceptors  
**Routing**: React Router v6  
**Scalability**: Ready for growth
