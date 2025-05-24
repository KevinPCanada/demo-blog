// client/src/pages/Home/Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import './Home.css';
import HomeCard from "../../components/HomeCard/HomeCard"; // Your card component

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [sidebarPosts, setSidebarPosts] = useState([]);
  const [gridPosts, setGridPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendUrl = "http://localhost:8800"; // Define for constructing image URLs

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${backendUrl}/api/posts`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Failed to fetch posts and parse error' }));
          throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setPosts(data); // Store all fetched posts

        // Process posts for layout
        if (data && data.length > 0) {
          setFeaturedPost(data[0]); // Latest post is featured
          setSidebarPosts(data.slice(1, 3)); // Next two for sidebar
          setGridPosts(data.slice(3)); // The rest for the grid
        } else {
          // Handle cases with fewer posts if necessary
          setFeaturedPost(null);
          setSidebarPosts([]);
          setGridPosts([]);
        }

      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError(err.message || "Failed to load posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []); // Empty dependency array means this runs once when the component mounts

  // Helper to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, text.lastIndexOf(" ", maxLength)) + "...";
  };

  // Function to construct full image URL
  const getImageUrl = (imgPath) => {
    if (!imgPath) {
      return "https://via.placeholder.com/400x250.png?text=No+Image"; // Default placeholder
    }
    // Assuming imgPath from DB is like "/uploads/image.png"
    return `${backendUrl}${imgPath}`;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em' }}>Loading posts...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'red', fontSize: '1.2em' }}>Error: {error}</div>;
  }

  if (posts.length === 0 && !loading) {
    return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em' }}>No posts available yet.</div>;
  }

  return (
    <div className="home-page">
      <main className="main-content-area">
        {featuredPost && (
          <section className="top-content">
            <article className="featured-post-container">
              <img 
                src={getImageUrl(featuredPost.img)} 
                alt={featuredPost.title} 
                className="featured-post-image" 
              />
              <div className="featured-post-content">
                <h2>{featuredPost.title}</h2>
                {/* Use 'description' for snippet, 'content' for full post */}
                <p>{truncateText(featuredPost.description, 250)}</p> 
                <Link to={`/post/${featuredPost.id}`} className="read-more-link">
                  Read More →
                </Link>
              </div>
            </article>

            <aside className="sidebar-posts-container">
              {sidebarPosts.map((post) => (
                post && // Add a check in case sidebarPosts has fewer than 2 items
                <div className="sidebar-post-card" key={post.id}>
                  <img 
                    src={getImageUrl(post.img)} 
                    alt={post.title} 
                    className="sidebar-post-image" 
                  />
                  <div className="sidebar-post-content">
                    <h4>{post.title}</h4>
                    <p>{truncateText(post.description, 80)}</p>
                    <Link to={`/post/${post.id}`} className="read-more-link">
                      Read More →
                    </Link>
                  </div>
                </div>
              ))}
            </aside>
          </section>
        )}

        <section className="posts-grid-container">
          {gridPosts.map((post) => (
            post && // Add a check
            <HomeCard 
              key={post.id} 
              post={{...post, img: getImageUrl(post.img)}} // Pass post with full image URL
            />
          ))}
        </section>
      </main>
    </div>
  );
};

export default Home;