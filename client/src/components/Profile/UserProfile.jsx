import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchUser = async () => {
    try {
      const userData = await api.getUser(id);
      if (userData) {
        setUser(userData);
        setFormData({
          username: userData.username,
          email: userData.email,
        });
      } else {
        setError("User not found");
      }
    } catch (error) {
      setError("Error loading user profile");
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: user.username,
      email: user.email,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const updatedUser = await api.updateUser(id, formData);
      setUser(updatedUser);
      setIsEditing(false);

      // Update localStorage if it's the current user
      if (currentUser && currentUser.id === parseInt(id)) {
        localStorage.setItem("userData", JSON.stringify(updatedUser));
      }
    } catch (error) {
      setError("Error updating profile");
      console.error("Error updating user:", error);
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

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-container">
        <h2>User not found</h2>
      </div>
    );
  }

  const canEdit = currentUser && currentUser.id === parseInt(id);

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>User Profile</h2>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Updating..." : "Update Profile"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="profile-field">
              <label>Username:</label>
              <span>{user.username}</span>
            </div>

            <div className="profile-field">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>

            <div className="profile-field">
              <label>Member since:</label>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>

            {canEdit && (
              <div className="profile-actions">
                <button onClick={handleEdit} className="btn-primary">
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
