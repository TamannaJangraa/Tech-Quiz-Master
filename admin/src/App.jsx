import { Routes, Route, useLocation, Link } from "react-router-dom";
import { useUser } from "@clerk/react";

import Home from "./pages/Home";
import Dashboard from "./components/Dashboard";
import ListPage from "./pages/ListPage";

const ADMIN_USER_ID = "user_3GzMxeTh7XrwPpPOEL0ybOpvvYN";

function RequireAdmin({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">
          Loading...
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Authentication Required
          </h1>

          <p className="text-gray-600 mb-5">
            Please sign in to access the Admin Panel.
          </p>

          <Link
            to="/"
            state={{ from: location }}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Logged in, but not admin
  if (user?.id !== ADMIN_USER_ID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-3">
            Access Denied 🚫
          </h1>

          <p className="text-gray-600 mb-5">
            You do not have permission to access the Admin Panel.
          </p>

          <Link
            to="/"
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return children;
}

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/dashboard"
        element={
          <RequireAdmin>
            <Dashboard />
          </RequireAdmin>
        }
      />

      <Route
        path="/list"
        element={
          <RequireAdmin>
            <ListPage />
          </RequireAdmin>
        }
      />
    </Routes>
  );
};

export default App;