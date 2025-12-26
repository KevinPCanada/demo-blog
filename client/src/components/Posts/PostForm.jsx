import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

// Custom Dropdown Component
const CustomDropdown = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="custom-dropdown">
      <button
        type="button"
        className="dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption?.value ? "selected" : "placeholder"}>
          {selectedOption?.label || "Select a category"}
        </span>
        <svg
          className={`dropdown-arrow ${isOpen ? "open" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`dropdown-option ${
                option.value === value ? "selected" : ""
              }`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
    img: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEditing = Boolean(id);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (isEditing) {
      fetchPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isEditing, id]);

  const fetchPost = async () => {
    try {
      const post = await api.getPost(id);
      if (post && (post.uid === user.id || user.role === "admin")) {
        setFormData({
          title: post.title,
          description: post.description || "",
          content: post.content,
          category: post.category || "",
          img: post.img || "",
        });
      } else {
        setError("You are not authorized to edit this post");
      }
    } catch (error) {
      setError("Error loading post");
      console.error("Error fetching post:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.description.trim()
    ) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const postData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        category: formData.category.trim() || "General",
        img: formData.img.trim(),
      };

      if (isEditing) {
        const result = await api.updatePost(id, postData);
        if (result.message) {
          alert(result.message);
        }
      } else {
        const result = await api.createPost(postData);
        if (result.message) {
          alert(result.message);
        }
      }

      navigate("/");
    } catch (error) {
      setError(isEditing ? "Error updating post" : "Error creating post");
      console.error("Error saving post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await api.uploadFile(file);
      // Set the image URL in the form
      setFormData({
        ...formData,
        img: result.url,
      });
      if (result.message) {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file: " + error.message);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="post-form-container">
      <form className="post-form" onSubmit={handleSubmit}>
        <h2>{isEditing ? "Edit Post" : "Create New Post"}</h2>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter your post title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Write a short description of your post"
            rows="3"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <CustomDropdown
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value })}
            options={[
              { value: "", label: "Select a category" },
              { value: "Technology", label: "Technology" },
              { value: "Culture", label: "Culture" },
              { value: "Food", label: "Food" },
              { value: "Travel", label: "Travel" },
              { value: "Lifestyle", label: "Lifestyle" },
              { value: "Health", label: "Health" },
              { value: "Business", label: "Business" },
              { value: "Entertainment", label: "Entertainment" },
              { value: "Sports", label: "Sports" },
              { value: "Education", label: "Education" },
              { value: "General", label: "General" },
            ]}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your post content here..."
            rows="15"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="file-upload">Upload Image</label>
          {formData.img && (
            <div className="current-image">
              <p>Current image:</p>
              <img
                src={
                  formData.img.startsWith("http")
                    ? formData.img
                    : `http://localhost:8800/${formData.img}`
                }
                alt="Current post image"
                style={{
                  maxWidth: "200px",
                  maxHeight: "150px",
                  objectFit: "cover",
                  marginBottom: "10px",
                }}
              />
            </div>
          )}
          <div className="file-upload-container">
            <input
              type="file"
              id="file-upload"
              className="file-upload-input-hidden"
              accept="image/*"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="file-upload"
              className={`file-upload-button ${formData.img ? "has-file" : ""}`}
            >
              <svg
                className="file-upload-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {formData.img ? "Change Image" : "Choose Image"}
            </label>
          </div>
          <small>
            {formData.img
              ? "Upload a new image to replace the current one"
              : "Upload an image to set as the post image"}
          </small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? isEditing
                ? "Updating..."
                : "Publishing..."
              : isEditing
              ? "Update Post"
              : "Publish Post"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
