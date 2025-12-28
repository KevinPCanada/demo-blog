export const API_BASE_URL = import.meta.env.PROD 
  ? "/api" 
  : "http://localhost:8800/api";
  
export const api = {
  // Authentication
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include", // Include cookies
      });

      if (response.ok) {
        const message = await response.text();
        return { success: true, message };
      } else {
        const error = await response.text();
        return { success: false, error };
      }
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "Network error" };
    }
  },

  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include", // Include cookies
      });

      if (response.ok) {
        const user = await response.json();
        return { success: true, user };
      } else {
        const error = await response.text();
        return { success: false, error };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error" };
    }
  },

  logout: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // Include cookies
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: "Logout failed" };
      }
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: "Network error" };
    }
  },

  // Posts
  getAllPosts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        credentials: "include",
      });

      if (response.ok) {
        const posts = await response.json();
        return posts;
      } else {
        console.warn("Backend server not responding, using empty posts array");
        return [];
      }
    } catch (error) {
      console.warn("Backend server not available:", error.message);
      // Return empty array instead of throwing error to prevent app crash
      return [];
    }
  },

  getPost: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
        credentials: "include",
      });

      if (response.ok) {
        const post = await response.json();
        return post;
      } else if (response.status === 404) {
        return null;
      } else {
        throw new Error("Failed to fetch post");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      throw error;
    }
  },

  createPost: async (postData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else if (response.status === 401) {
        throw new Error("Not authenticated!");
      } else {
        throw new Error("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },

  updatePost: async (id, postData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else if (response.status === 401) {
        throw new Error("Not authenticated!");
      } else {
        throw new Error("Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  },

  deletePost: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else if (response.status === 401) {
        throw new Error("Not authenticated!");
      } else {
        throw new Error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  },

  // Upload
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        
        return { url: result.url }; 
      } else {
        const error = await response.json();
        throw new Error(error.error || "File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },

  // Users (if needed for profile management)
  getUser: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        credentials: "include",
      });

      if (response.ok) {
        const user = await response.json();
        return user;
      } else if (response.status === 404) {
        return null;
      } else {
        throw new Error("Failed to fetch user");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      if (response.ok) {
        const user = await response.json();
        return user;
      } else if (response.status === 401) {
        throw new Error("Not authenticated!");
      } else {
        throw new Error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },
};
