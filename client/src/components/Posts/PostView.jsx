import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

const PostView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPost = async () => {
    try {
      const postData = await api.getPost(id);
      if (postData) {
        setPost(postData);
      } else {
        setError("Post not found");
      }
    } catch (error) {
      setError("Error loading post");
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/edit/${post.id}`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const result = await api.deletePost(post.id);
        if (result.message) {
          alert(result.message);
        }
        navigate("/");
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Error deleting post");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")} className="btn-secondary">
          Back to Home
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="error-container">
        <h2>Post not found</h2>
        <button onClick={() => navigate("/")} className="btn-secondary">
          Back to Home
        </button>
      </div>
    );
  }

  const canEditPost = user && (user.id === post.uid || user.role === "admin");

  return (
    <div className="post-view-container">
      <article className="post-view">
        <header className="post-view-header">
          <h1 className="post-view-title">{post.title}</h1>
          {post.img && (
            <div className="post-view-image">
              <img src={`http://localhost:8800/${post.img}`} alt={post.title} />
            </div>
          )}
          <div className="post-view-meta">
            <div className="post-author-info">
             <span className="author">By {post.authorName}</span>
              <span className="category">Category: {post.category}</span>
              <span className="date">{formatDate(post.date)}</span>
            </div>
            {canEditPost && (
              <div className="post-actions">
                <button onClick={handleEdit} className="btn-edit">
                  Edit
                </button>
                <button onClick={handleDelete} className="btn-delete">
                  Delete
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="post-view-content">
          <div className="content-text">
            {post.content.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <footer className="post-view-footer">
          <button onClick={() => navigate("/")} className="btn-secondary">
            ← Back to Posts
          </button>
        </footer>
      </article>
    </div>
  );
};

export default PostView;
