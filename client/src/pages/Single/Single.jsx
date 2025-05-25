// client/src/pages/Single/Single.jsx
import React, { useEffect, useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { AuthContext } from "../../context/authContext.jsx";
import "./Single.css";

export default function Single() {
  const [post, setPost] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate(); // Make sure navigate is defined if you use it (e.g. in handleDelete)
  const postId = location.pathname.split("/")[2];
  const { currentUser } = useContext(AuthContext);

  const backendUrl = "http://localhost:8800"; // Centralize backend URL

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      let rawResponseText = '';

      console.log("Attempting to fetch post with ID:", postId);

      try {
        // Using absolute URL to ensure it bypasses potential Vite proxy issues for now
        const response = await fetch(`${backendUrl}/api/posts/${postId}`);
        rawResponseText = await response.text();

        if (!response.ok) {
          let errorMsg = `HTTP error! Status: ${response.status}. Response: ${rawResponseText.substring(0, 200)}...`;
          try {
            const errorData = JSON.parse(rawResponseText);
            errorMsg = errorData.message || errorData.error || JSON.stringify(errorData);
          } catch (jsonParseError) {
            console.warn("Response was not OK and not valid JSON. Raw response:", rawResponseText);
          }
          throw new Error(errorMsg);
        }
        const data = JSON.parse(rawResponseText);
        setPost(data);
      } catch (err) {
        console.error("Error during fetch operation for post ID:", postId);
        console.error("Raw response text that caused error (if any):", rawResponseText);
        console.error("Full error object:", err);
        setError(`Failed to process post data: ${err.message}. Check console for raw response.`);
      }
      setLoading(false);
    };

    if (postId) {
      fetchData();
    } else {
      setError("No post ID found in URL.");
      setLoading(false);
    }
  }, [postId, backendUrl]); // Added backendUrl to dependency array as it's used in effect

  // Ensure handleDelete is defined if used
  const handleDelete = async () => {
    // ... your delete logic ...
    // Remember to use `${backendUrl}/api/posts/${postId}` for the delete request too
    console.log("Delete button clicked - implement handleDelete function");
     try {
      const response = await fetch(`${backendUrl}/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        // credentials: 'include', // If using cookies and backend is on different origin and CORS configured
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete and parse error response' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      console.log("Post deleted successfully");
      navigate("/"); 
    } catch (err) {
      console.error("Error deleting post:", err);
      setError(err.message || "Failed to delete post.");
    }
  };


  if (loading) {
    return <div className="single">Loading post...</div>;
  }
  if (error) {
    return (
      <div className="single">
        <p>Error: {error}</p>
        <Link to="/">Go back home</Link>
      </div>
    );
  }
  if (!post || Object.keys(post).length === 0) {
    return (
      <div className="single">
        <p>Post not found or unable to display.</p>
        <Link to="/">Go back home</Link>
      </div>
    );
  }

  const placeholderUserImg = "https://via.placeholder.com/50";
  const placeholderPostImg = "https://via.placeholder.com/800x400?text=Blog+Post+Image";

  const postImageSrc = post.img
    ? `${backendUrl}${post.img}` // Use backendUrl + path from DB
    : placeholderPostImg;

  const authorImageSrc = placeholderUserImg; // Always use placeholder as we don't have authorImg from API

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
                <span>By {post.authorName || "Unknown Author"}</span>
                <p>Posted {post.date ? moment(post.date).fromNow() : "a while ago"}</p>
              </div>
              {currentUser && post.uid === currentUser.id && ( // Check uid against currentUser.id
                <div className="edit">
                  <Link to={`/write?edit=${post.id}`} state={post}>
                    <button>Edit</button>
                  </Link>
                  <button onClick={handleDelete}>Delete</button>
                </div>
              )}
            </div>
          </div>
          <div className="post-content">
            <h1>{post.title}</h1>
            <div className="article-body" dangerouslySetInnerHTML={{ __html: post.content || "" }} />
          </div>
        </article>
      </div>
    </div>
  );
}