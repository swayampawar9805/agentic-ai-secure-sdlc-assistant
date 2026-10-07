import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "../../styles/login.css";

export default function Login() {

  const navigate = useNavigate();

  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");

    if (!username.trim() || !password) {

      setError(
        "Please enter your username and password."
      );

      return;
    }

    try {

      setLoading(true);

      await login(
        username.trim(),
        password
      );

      navigate(
        "/dashboard",
        { replace: true }
      );

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      if (error.response?.data?.detail) {

        setError(
          error.response.data.detail
        );

      } else if (error.response) {

        setError(
          "Invalid username or password."
        );

      } else {

        setError(
          "Unable to connect to the server."
        );

      }

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="login-page">

      <div className="login-wrapper">

        {/* Brand */}

        <div className="login-brand">

          <div className="login-logo">
            AI
          </div>

          <div className="login-brand-text">

            <h1>
              Secure SDLC Assistant
            </h1>

            <p>
              Agentic AI Security Platform
            </p>

          </div>

        </div>

        {/* Login Card */}

        <div className="login-card">

          <div className="login-header">

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to access your security
              workspace and continue securing
              your software lifecycle.
            </p>

          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            <div className="form-group">

              <label htmlFor="username">
                Username
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value
                  )
                }
                placeholder="Enter your username"
                autoComplete="username"
              />

            </div>

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter your password"
                autoComplete="current-password"
              />

            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
            >

              {loading
                ? "Authenticating..."
                : "Sign In"
              }

            </button>

          </form>
          <Link to="/register">
              Create account
          </Link>

          <div className="login-security">

            <span className="login-security-dot" />

            <span>
              Secure JWT authentication enabled
            </span>

          </div>

        </div>

        <div className="login-footer">

          Agentic AI Secure SDLC Assistant

        </div>

      </div>

    </div>
  );
}