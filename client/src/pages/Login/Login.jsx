import { React, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from '/src/context/AuthContext';
import "./Login.css";

const Login = () => {
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });

  const [err, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext)

  // Handle input change
  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      await login(inputs);
      setError(null);
      navigate("/");
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="login-container">
      <div className="auth">
        <h1>Login</h1>
        {/* Attach onSubmit to the form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            required
            type="text"
            placeholder="username"
            name="username"
            onChange={handleChange}
          />
          <input
            required
            type="password"
            placeholder="password"
            name="password"
            onChange={handleChange}
          />
          {err && <p style={{ color: "red" }}>{err}</p>}
          <button type="submit">Login</button>
        </form>
        <p>Not a member?</p>
        <Link to="/register">Sign up now!</Link>
      </div>
    </div>
  );
};

export default Login;
