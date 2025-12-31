import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={() => navigate("/")}>
          <h2>Everyday Bytes</h2>
        </div>
        <nav className="nav">
          {user ? (
            <>
              <button className="nav-link" onClick={() => navigate("/create")}>
                Write Post
              </button>
        
              <button className="nav-link logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="nav-link" onClick={() => navigate("/login")}>
                Login
              </button>
              <button
                className="nav-link register"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
