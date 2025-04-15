import { React, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {

  const [err, setError] = useState(null)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a new FormData object from the form
    const formData = new FormData(e.target);

    // Convert FormData to a plain object
    const formObject = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("http://localhost:8800/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formObject),
      });

      if (res.status === 409) {
        console.log("User already exists");
      } else if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log(data); // Success response

       // Redirect to the login page after successful registration
       navigate("/login"); // Navigate to the login page

    } catch (err) {
      setError(err.response.data)
    }
  };

  return (
    <div className="register-container">
      <div className="auth">
        <h1>Register</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            required
            type="text"
            placeholder="username"
            name="username"
          />
          <input
            required
            type="email"
            placeholder="email"
            name="email"
          />
          <input
            required
            type="password"
            placeholder="password"
            name="password"
          />
          {err && <p style={{ color: "red" }}>{err}</p>}
          <button type="submit">Sign Up</button>
        </form>
        <p>Already a member?</p>
        <Link to="/Login">Log in</Link>
      </div>
    </div>
  );
};

export default Register;
