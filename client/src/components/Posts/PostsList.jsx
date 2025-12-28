import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

const PostsList = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    filterPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, selectedCategory]);

  const fetchPosts = async () => {
    try {
      const postsData = await api.getAllPosts();
      setPosts(postsData);

      // Extract unique categories
      const uniqueCategories = [
        "All",
        ...new Set(postsData.map((post) => post.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching posts:", error);
      // Show empty state when backend is not available or connection fails
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    if (selectedCategory === "All") {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(
        posts.filter((post) => post.category === selectedCategory)
      );
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateDescription = (description, maxLength = 150) => {
    if (!description) return "";
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  // Smart Image URL Fix
  const getImageUrl = (img) => {
    if (!img) return "";
    // If it starts with http, it's Cloudinary. If not, it's local.
    return img.startsWith("http") ? img : `http://localhost:8800/${img}`;
  };

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  if (filteredPosts.length === 0 && posts.length === 0) {
    return (
      <div className="empty-state">
        <h3>No posts yet</h3>
        <p>Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="posts-container">
      <h1>Latest</h1>

      {/* Featured Latest Post */}
      {filteredPosts.length > 0 && (
        <div className="featured-post-section">
          <article
            className="featured-post"
            onClick={() => navigate(`/post/${filteredPosts[0].id}`)}
          >
            <div className="featured-post-content">
              <div className="featured-post-text">
                <div className="featured-post-category">
                  {filteredPosts[0].category}
                </div>
                <h2 className="featured-post-title">
                  {filteredPosts[0].title}
                </h2>
                <p className="featured-post-description">
                  {truncateDescription(filteredPosts[0].description, 200)}
                </p>
                <div className="featured-post-meta">
                  <span className="post-author">
                    By {filteredPosts[0].authorName}
                  </span>
                  <span className="post-date">
                    {formatDate(filteredPosts[0].date)}
                  </span>
                </div>
              </div>
              {filteredPosts[0].img && (
                <div className="featured-post-image">
                  <img
                    src={getImageUrl(filteredPosts[0].img)}
                    alt={filteredPosts[0].title}
                  />
                </div>
              )}
            </div>
          </article>
        </div>
      )}

      {posts.length > 0 && (
        <div className="category-filter">
          <h3>Filter by Category:</h3>
          <div className="category-buttons">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-btn ${
                  selectedCategory === category ? "active" : ""
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Remaining Posts */}
      {filteredPosts.length > 1 && (
        <div className="remaining-posts-section">
          <h2 className="section-title">More Stories</h2>
          <div className="posts-grid">
            {filteredPosts.slice(1).map((post) => (
              <article
                key={post.id}
                className="post-card"
                onClick={() => navigate(`/post/${post.id}`)}
              >
                {post.img && (
                  <div className="post-image">
                    <img
                      src={getImageUrl(post.img)}
                      alt={post.title}
                    />
                  </div>
                )}
                <div className="post-header">
                  <h2 className="post-title">{post.title}</h2>
                  <div className="post-meta">
                    <span className="post-author">By {post.authorName}</span>
                    <span className="post-category">{post.category}</span>
                    <span className="post-date">{formatDate(post.date)}</span>
                  </div>
                </div>
                <div className="post-content">
                  <p>{truncateDescription(post.description)}</p>
                </div>
                <div className="post-footer">
                  <span className="read-more">Read more →</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {filteredPosts.length === 0 && posts.length > 0 ? (
        <div className="empty-state">
          <h3>No posts found</h3>
          <p>{`No posts match the selected category "${selectedCategory}"`}</p>
        </div>
      ) : null}
    </div>
  );
};

export default PostsList;
