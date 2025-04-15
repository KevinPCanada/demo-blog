import React, { useState, useContext } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

const Navbar = () => {
  // Doing this to modify the page according to the user. We'll be calling the information in the parameters.

  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // State to track whether the links are visible or hidden
  const [linksVisible, setLinksVisible] = useState(false);

  // Function to toggle the visibility of the links
  const toggleLinks = () => {
    setLinksVisible(!linksVisible);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="navbar">
      <div className="container">
        <div className="logo">
          <Link to={"/"}>
            <h1>Everyday Bytes</h1>
          </Link>

          {/* Static arrow symbol that will rotate */}
          <div
            className={`toggle-arrow ${linksVisible ? "rotate" : ""}`}
            onClick={toggleLinks}
          >
            ▼
          </div>
        </div>
        <div className={`links ${linksVisible ? "visible" : ""}`}>
          <Link to="/?cat=culture">
            <h6>Culture</h6>
          </Link>
          <Link to="/?cat=food">
            <h6>Food</h6>
          </Link>
          <Link to="/?cat=tv"> 
            <h6>TV</h6>
          </Link>
          <Link to="/?cat=tech">
            <h6>Tech</h6>
          </Link>
          {/* Username */}
          {currentUser && <span className="username">{currentUser.username}</span>}
          {/* Auth button */}
          {currentUser ? (
            <button className="auth-button" onClick={handleLogout}>Logout</button>
          ) : (
            <Link className="auth-button" to="/login">Login</Link>
          )}
          {currentUser && (
            <span className="write">
              <Link to="/write">Write</Link>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
