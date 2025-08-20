import React, { useState, useEffect } from "react";
import ApiService from "./api";

function Settings({ user, onUserUpdate, onBack }) {
    const [settings, setSettings] = useState({
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        attemptedReviewDays: 3,
        solvedReviewDays: 5
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadUserSettings();
    }, []);

    const loadUserSettings = async () => {
        try {
            const response = await ApiService.getUserSettings();
            setSettings({
                email: response.user.email,
                firstName: response.user.firstName,
                lastName: response.user.lastName,
                attemptedReviewDays: response.settings.attemptedReviewDays || 3,
                solvedReviewDays: response.settings.solvedReviewDays || 5
            });
        } catch (error) {
            console.error('Failed to load user settings:', error);
            setMessage("Failed to load settings");
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!settings.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(settings.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!settings.firstName.trim()) {
            newErrors.firstName = "First name is required";
        }

        if (!settings.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        }

        if (settings.attemptedReviewDays < 1 || settings.attemptedReviewDays > 30) {
            newErrors.attemptedReviewDays = "Must be between 1 and 30 days";
        }

        if (settings.solvedReviewDays < 1 || settings.solvedReviewDays > 30) {
            newErrors.solvedReviewDays = "Must be between 1 and 30 days";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSaving(true);
        setMessage("");

        try {
            const response = await ApiService.updateUserSettings(settings);
            if (response.success) {
                setMessage("Settings saved successfully!");
                onUserUpdate({
                    ...user,
                    email: settings.email,
                    firstName: settings.firstName,
                    lastName: settings.lastName,
                    attemptedReviewDays: settings.attemptedReviewDays,
                    solvedReviewDays: settings.solvedReviewDays
                });
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            setMessage("Failed to save settings. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                backgroundColor: "#1a1a1a",
                color: "#FDFDFD"
            }}>
                Loading settings...
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: "#1a1a1a",
            minHeight: "100vh",
            color: "#FDFDFD"
        }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 2rem",
                backgroundColor: "#F99D07",
                marginBottom: "2rem"
            }}>
                <div>
                    <h1 style={{ margin: 0, color: "#FDFDFD" }}>Settings</h1>
                    <p style={{ margin: "0.5rem 0 0 0", color: "#FDFDFD", opacity: 0.9 }}>
                        Manage your account and preferences
                    </p>
                </div>
                <button
                    onClick={onBack}
                    style={{
                        backgroundColor: "#FDFDFD",
                        color: "#F99D07",
                        border: "1px solid #F99D07",
                        padding: "0.5rem 1rem",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                >
                    Back to Problems
                </button>
            </div>

            <div style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: "0 2rem"
            }}>
                {message && (
                    <div style={{
                        backgroundColor: message.includes("success") ? "#4CAF50" : "#f44336",
                        color: "#FDFDFD",
                        padding: "1rem",
                        borderRadius: "5px",
                        marginBottom: "2rem",
                        textAlign: "center"
                    }}>
                        {message}
                    </div>
                )}

                <div style={{
                    backgroundColor: "#2a2a2a",
                    padding: "2rem",
                    borderRadius: "10px",
                    border: "2px solid #F99D07"
                }}>
                    <h2 style={{
                        color: "#F99D07",
                        marginBottom: "2rem",
                        borderBottom: "2px solid #F99D07",
                        paddingBottom: "0.5rem"
                    }}>
                        Account Information
                    </h2>

                    <div style={{
                        display: "grid",
                        gap: "1.5rem",
                        marginBottom: "3rem"
                    }}>
                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: "bold",
                                color: "#F99D07"
                            }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    borderRadius: "5px",
                                    border: errors.email ? "2px solid #f44336" : "1px solid #F99D07",
                                    backgroundColor: "#1a1a1a",
                                    color: "#FDFDFD",
                                    fontSize: "1rem",
                                    boxSizing: "border-box"
                                }}
                            />
                            {errors.email && (
                                <span style={{ color: "#f44336", fontSize: "0.9rem" }}>
                                    {errors.email}
                                </span>
                            )}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div>
                                <label style={{
                                    display: "block",
                                    marginBottom: "0.5rem",
                                    fontWeight: "bold",
                                    color: "#F99D07"
                                }}>
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={settings.firstName}
                                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        borderRadius: "5px",
                                        border: errors.firstName ? "2px solid #f44336" : "1px solid #F99D07",
                                        backgroundColor: "#1a1a1a",
                                        color: "#FDFDFD",
                                        fontSize: "1rem",
                                        boxSizing: "border-box"
                                    }}
                                />
                                {errors.firstName && (
                                    <span style={{ color: "#f44336", fontSize: "0.9rem" }}>
                                        {errors.firstName}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label style={{
                                    display: "block",
                                    marginBottom: "0.5rem",
                                    fontWeight: "bold",
                                    color: "#F99D07"
                                }}>
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={settings.lastName}
                                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        borderRadius: "5px",
                                        border: errors.lastName ? "2px solid #f44336" : "1px solid #F99D07",
                                        backgroundColor: "#1a1a1a",
                                        color: "#FDFDFD",
                                        fontSize: "1rem",
                                        boxSizing: "border-box"
                                    }}
                                />
                                {errors.lastName && (
                                    <span style={{ color: "#f44336", fontSize: "0.9rem" }}>
                                        {errors.lastName}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <h2 style={{
                        color: "#F99D07",
                        marginBottom: "2rem",
                        borderBottom: "2px solid #F99D07",
                        paddingBottom: "0.5rem"
                    }}>
                        Review Preferences
                    </h2>

                    <div style={{
                        display: "grid",
                        gap: "1.5rem",
                        marginBottom: "2rem"
                    }}>
                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: "bold",
                                color: "#F99D07"
                            }}>
                                Days to Review Attempted Problems
                            </label>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={settings.attemptedReviewDays}
                                    onChange={(e) => handleInputChange("attemptedReviewDays", parseInt(e.target.value) || 1)}
                                    style={{
                                        width: "100px",
                                        padding: "0.75rem",
                                        borderRadius: "5px",
                                        border: errors.attemptedReviewDays ? "2px solid #f44336" : "1px solid #F99D07",
                                        backgroundColor: "#1a1a1a",
                                        color: "#FDFDFD",
                                        fontSize: "1rem",
                                        textAlign: "center"
                                    }}
                                />
                                <span style={{ color: "#FDFDFD", opacity: 0.8 }}>
                                    days after adding the problem
                                </span>
                            </div>
                            {errors.attemptedReviewDays && (
                                <span style={{ color: "#f44336", fontSize: "0.9rem" }}>
                                    {errors.attemptedReviewDays}
                                </span>
                            )}
                            <p style={{
                                color: "#FDFDFD",
                                opacity: 0.7,
                                fontSize: "0.9rem",
                                marginTop: "0.5rem"
                            }}>
                                How many days after adding an "Attempted" problem should it appear in your review queue?
                            </p>
                        </div>

                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: "bold",
                                color: "#F99D07"
                            }}>
                                Days to Review Solved Problems
                            </label>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={settings.solvedReviewDays}
                                    onChange={(e) => handleInputChange("solvedReviewDays", parseInt(e.target.value) || 1)}
                                    style={{
                                        width: "100px",
                                        padding: "0.75rem",
                                        borderRadius: "5px",
                                        border: errors.solvedReviewDays ? "2px solid #f44336" : "1px solid #F99D07",
                                        backgroundColor: "#1a1a1a",
                                        color: "#FDFDFD",
                                        fontSize: "1rem",
                                        textAlign: "center"
                                    }}
                                />
                                <span style={{ color: "#FDFDFD", opacity: 0.8 }}>
                                    days after adding the problem
                                </span>
                            </div>
                            {errors.solvedReviewDays && (
                                <span style={{ color: "#f44336", fontSize: "0.9rem" }}>
                                    {errors.solvedReviewDays}
                                </span>
                            )}
                            <p style={{
                                color: "#FDFDFD",
                                opacity: 0.7,
                                fontSize: "0.9rem",
                                marginTop: "0.5rem"
                            }}>
                                How many days after adding a "Solved" problem should it appear in your review queue?
                            </p>
                        </div>
                    </div>

                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "1rem",
                        paddingTop: "2rem",
                        borderTop: "1px solid #F99D07"
                    }}>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            style={{
                                backgroundColor: "#F99D07",
                                color: "#FDFDFD",
                                border: "none",
                                padding: "1rem 2rem",
                                borderRadius: "5px",
                                cursor: isSaving ? "not-allowed" : "pointer",
                                fontSize: "1rem",
                                fontWeight: "bold",
                                opacity: isSaving ? 0.7 : 1
                            }}
                        >
                            {isSaving ? "Saving..." : "Save Settings"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;