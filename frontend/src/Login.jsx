import React, { useState } from "react";

function Login({ onLogin, onSignup }) {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!email || !password) {
            setError("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        if (isSignup && (!firstName || !lastName)) {
            setError("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setIsLoading(false);
            return;
        }

        try {
            const result = isSignup 
                ? await onSignup(email, password, firstName, lastName) 
                : await onLogin(email, password);
            
            if (!result.success) {
                setError(result.message || "An error occurred");
            }
        } catch (error) {
            setError("An unexpected error occurred");
            console.error("Login/Signup error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsSignup(!isSignup);
        setError("");
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5"
        }}>
            <div style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                width: "400px",
                maxWidth: "90%"
            }}>
                <h2 style={{
                    textAlign: "center",
                    marginBottom: "2rem",
                    color: "#1a1a1a",
                    fontSize: "2rem"
                }}>
                    {isSignup ? "Sign Up" : "Login"}
                </h2>

                <form onSubmit={handleSubmit}>
                    {isSignup && (
                        <>
                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{
                                    display: "block",
                                    marginBottom: "0.5rem",
                                    color: "#333",
                                    fontWeight: "bold"
                                }}>
                                    First Name:
                                </label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.7rem",
                                        border: "2px solid #F99D07",
                                        borderRadius: "5px",
                                        fontSize: "1rem",
                                        outline: "none",
                                        boxSizing: "border-box"
                                    }}
                                    placeholder="Enter your first name"
                                    disabled={isLoading}
                                />
                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{
                                    display: "block",
                                    marginBottom: "0.5rem",
                                    color: "#333",
                                    fontWeight: "bold"
                                }}>
                                    Last Name:
                                </label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.7rem",
                                        border: "2px solid #F99D07",
                                        borderRadius: "5px",
                                        fontSize: "1rem",
                                        outline: "none",
                                        boxSizing: "border-box"
                                    }}
                                    placeholder="Enter your last name"
                                    disabled={isLoading}
                                />
                            </div>
                        </>
                    )}

                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            color: "#333",
                            fontWeight: "bold"
                        }}>
                            Email:
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.7rem",
                                border: "2px solid #F99D07",
                                borderRadius: "5px",
                                fontSize: "1rem",
                                outline: "none",
                                boxSizing: "border-box"
                            }}
                            placeholder="Enter your email"
                            disabled={isLoading}
                        />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            color: "#333",
                            fontWeight: "bold"
                        }}>
                            Password:
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.7rem",
                                border: "2px solid #F99D07",
                                borderRadius: "5px",
                                fontSize: "1rem",
                                outline: "none",
                                boxSizing: "border-box"
                            }}
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <div style={{
                            color: "red",
                            marginBottom: "1rem",
                            textAlign: "center",
                            fontSize: "0.9rem"
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            padding: "0.8rem",
                            backgroundColor: isLoading ? "#ccc" : "#F99D07",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            marginBottom: "1rem"
                        }}
                    >
                        {isLoading ? "Please wait..." : (isSignup ? "Sign Up" : "Login")}
                    </button>
                </form>

                <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#666", marginBottom: "1rem" }}>
                        {isSignup ? "Already have an account?" : "Don't have an account?"}
                    </p>
                    <button
                        onClick={toggleMode}
                        disabled={isLoading}
                        style={{
                            background: "none",
                            border: "none",
                            color: isLoading ? "#ccc" : "#F99D07",
                            textDecoration: "underline",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            fontSize: "1rem"
                        }}
                    >
                        {isSignup ? "Login here" : "Sign up here"}
                    </button>
                </div>

                {/* Demo credentials display */}
                <div style={{
                    marginTop: "2rem",
                    padding: "1rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "5px",
                    fontSize: "0.9rem"
                }}>
                    <p style={{ margin: "0 0 0.5rem 0", fontWeight: "bold", color: "#666" }}>
                        Demo: Create an account or try:
                    </p>
                    <p style={{ margin: "0", color: "#666" }}>
                        Email: demo@example.com<br/>
                        Password: password123
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;