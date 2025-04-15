// This is a place to store and manage the user's authentication state (whether they're logged in or not, and their user information).

// Allows us to access the user's authentication state and authentication functions (like login and logout) from anywhere in the app without having to pass this information down through props.

// Helps maintain the user's logged-in state even when they refresh the page, by storing the user information in localStorage.

// Holds all the authentication-related logic (like making API calls to login or logout) in one place.

// Ensures that all parts of the app have the same, up-to-date information about the user's authentication status.

import { createContext, useState, useEffect } from "react";

// Create a new context for authentication
export const AuthContext = createContext();

// AuthContextProvider component to wrap the app and provide authentication state
export const AuthContextProvider = ({ children }) => {
  // Initialize currentUser state with data from localStorage, if any
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user") || null)
  );

  // Login function to authenticate user
  const login = async (inputs) => {
    try {
      // Send POST request to login API.
      const res = await fetch("http://localhost:8800/api/auth/login", {
        method: "POST",
        credentials: "include", // This line is crucial for CORS and cookies to work
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs), // Send the form inputs as JSON
      });

      // Handle non-OK responses
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Invalid username or password");
        } else {
          throw new Error(
            "There seems to be a problem. Please check your username and password and try again."
          );
        }
      }

      // Parse response data
      const data = await res.json();
      // Update currentUser state with logged in user data
      setCurrentUser(data);
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Logout function to end user session
  const logout = async () => {
    try {
      // Send POST request to logout API
      const res = await fetch("http://localhost:8800/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Logout failed");
      }

      // Clear currentUser state and remove user data from localStorage
      setCurrentUser(null);
      localStorage.removeItem("user");
    } catch (err) {
      console.error("Logout error:", err);
      // Still clear user data on client side even if server request fails
      setCurrentUser(null);
      localStorage.removeItem("user");
    }
  };

  // Effect to update localStorage when currentUser changes
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  // Provide AuthContext to children components
  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};