import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";
import "../styles/login.css";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        password_confirm: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (form.password !== form.password_confirm) {
            setError("Passwords do not match.");
            return;
        }

        if (form.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/register/", form);

            setSuccess(
                "Account created successfully. Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (error) {
            const data = error.response?.data;

            if (data) {
                const messages = Object.entries(data)
                    .flatMap(([field, value]) => {
                        if (Array.isArray(value)) {
                            return value.map(
                                (message) => `${field}: ${message}`
                            );
                        }

                        return `${field}: ${value}`;
                    });

                setError(
                    messages.join(" ") ||
                    "Registration failed."
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
            <div className="login-container">
                <div className="login-header">
                    <h1>Secure SDLC Assistant</h1>

                    <p>
                        Agentic AI Security Platform
                    </p>
                </div>

                <div className="login-card">
                    <div className="login-card-header">
                        <h2>Create Account</h2>

                        <p>
                            Create your developer account
                        </p>
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="login-success">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="first_name">
                                    First Name
                                </label>

                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    value={form.first_name}
                                    onChange={handleChange}
                                    placeholder="First name"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="last_name">
                                    Last Name
                                </label>

                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    value={form.last_name}
                                    onChange={handleChange}
                                    placeholder="Last name"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="username">
                                Username
                            </label>

                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="Enter username"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                Email
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Enter email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Minimum 8 characters"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password_confirm">
                                Confirm Password
                            </label>

                            <input
                                id="password_confirm"
                                name="password_confirm"
                                type="password"
                                value={form.password_confirm}
                                onChange={handleChange}
                                placeholder="Confirm password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="login-button"
                        >
                            {loading
                                ? "Creating Account..."
                                : "Create Account"}
                        </button>
                    </form>

                    <div className="login-footer">
                        <span>
                            Already have an account?
                        </span>

                        <Link to="/login">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;