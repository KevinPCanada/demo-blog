// client/src/pages/Single/Single.jsx
import React, { useEffect, useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Ensure useNavigate is imported
import moment from "moment";
import { AuthContext } from "../../context/authContext.jsx";
import "./Single.css";

export default function Single() {
  const [post, setPost] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State to display errors in your UI

  const location = useLocation();
  const navigate = useNavigate(); // Initialize navigate
  const postId = location.pathname.split("/")[2];
  const { currentUser } = useContext(AuthContext); // For checking ownership

  const backendUrl = "http://localhost:8800"; // Your backend URL

  // useEffect for fetching post data (fetchData function) should be here...
  // (Assuming your fetchData function is already implemented and working)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      // ... your existing fetchData logic ...
      try {
        const response = await fetch(`${backendUrl}/api/posts/${postId}`);
        // ... rest of fetch and error handling ...
        if (!response.ok) {
            // ... error handling for fetch ...
            const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}`}));
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.message || "Failed to fetch post.");
      }
      setLoading(false);
    };

    if (postId) {
      fetchData();
    } else {
      setError("No post ID found in URL.");
      setLoading(false);
    }
  }, [postId, backendUrl]);


  // --- DELETE POST FUNCTIONALITY ---
  const handleDelete = async () => {
    if (!currentUser) {
      alert("Please log in to delete posts.");
      setError("You must be logged in to delete posts.");
      return;
    }

    // Optional: Add a confirmation dialog for better UX
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post and its associated image? This action cannot be undone."
    );

    if (!confirmDelete) {
      return; // User cancelled the deletion
    }

    setError(null); // Clear previous errors before new attempt

    try {
      const response = await fetch(`${backendUrl}/api/posts/${postId}`, {
        method: "DELETE",
        // Headers like 'Content-Type' are not typically needed for a DELETE request without a body
        credentials: "include", // VERY IMPORTANT: To send the access_token cookie
      });

      if (!response.ok) {
        // Try to parse error message from backend if available
        const errorData = await response.json().catch(() => ({ // .catch for cases where response isn't valid JSON
          message: `Failed to delete post. Server responded with status: ${response.status}`
        }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Backend should send a JSON success message, e.g., { message: "Post deleted." }
      // Or if it sends plain text as in the example "Post and associated image have been deleted."
      const responseText = await response.text(); // Or response.json() if backend sends JSON
      console.log("Delete response from server:", responseText);

      alert(responseText || "Post deleted successfully!"); // Show success message
      navigate("/"); // Navigate to the homepage (or another appropriate page)

    } catch (err) {
      console.error("Error deleting post:", err);
      setError(err.message || "Failed to delete post. Please try again.");
      alert(`Error: ${err.message}`); // Show error to the user
    }
  };
  // --- END OF DELETE POST FUNCTIONALITY ---


  // Loading and error states rendering...
  if (loading) {
    return <div className="single">Loading post...</div>;
  }
  if (error) { // Display error messages from either fetching or deleting
    return (
      <div className="single">
        <p style={{ color: 'red' }}>Error: {error}</p>
        <Link to="/">Go back home</Link>
      </div>
    );
  }
  if (!post || Object.keys(post).length === 0) {
    // This check might need adjustment if an empty post is a valid state briefly
    // For now, assuming an empty 'post' after loading and no error means 'not found' or issue
    return ( <div className="single">Post not found.</div> );
  }

  // Image URL construction...
  const placeholderUserImg = "https://via.placeholder.com/50";
  const placeholderPostImg = "https://via.placeholder.com/800x400?text=Blog+Post+Image";
  const postImageSrc = post.img ? `${backendUrl}${post.img}` : placeholderPostImg;

  return (
    <div className="single">
      <div className="content">
        <article className="post-container">
          <div className="primary-image-container">
            <img src={postImageSrc} alt={post.title || "Blog post image"} />
          </div>
          <div className="post-header">
            <div className="user">
              <div className="info">
                <span>{post.authorName || "Unknown Author"}</span>
                <p>Posted {post.date ? moment(post.date).fromNow() : "a while ago"}</p>
              </div>
              {/* Edit and Delete Buttons */}
              {currentUser && post.uid === currentUser.id && (
                <div className="edit">
                  <Link to={`/write?edit=${post.id}`} state={post}>
                    <button>Edit</button>
                  </Link>
                  <button onClick={handleDelete}>Delete</button> {/* This calls the function */}
                </div>
              )}
            </div>
          </div>
          <div className="post-content">
            <h1>{post.title}</h1>
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: post.content || "" }}
            />
          </div>
        </article>
      </div>
      {/*  can add a Menu component here later if needed */}
      {/* <Menu category={post.category}/> */}
    </div>
  );
}