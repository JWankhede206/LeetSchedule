import React, { useState, useEffect } from "react";
import ToDoList from "./ToDoList";
import Login from "./Login";
import ApiService from "./api";

function ProblemDetails({ problem, onBack, onNotesUpdate }) {
    const [notes, setNotes] = useState(problem.notes || "");
    const [isSaving, setIsSaving] = useState(false);

    const handleNotesChange = async (e) => {
        const newNotes = e.target.value;
        setNotes(newNotes);
        
        // Auto-save notes after user stops typing
        setIsSaving(true);
        try {
            await ApiService.updateProblem(problem.id, {
                name: problem.name,
                difficulty: problem.difficulty,
                status: problem.status,
                notes: newNotes
            });
            onNotesUpdate(newNotes);
        } catch (error) {
            console.error('Failed to save notes:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div style={{ 
            padding: "2rem", 
            maxWidth: "800px", 
            margin: "0 auto",
            backgroundColor: "#1a1a1a",
            minHeight: "100vh"
        }}>
            {/* Header */}
            <div style={{ 
                display: "flex", 
                alignItems: "center", 
                marginBottom: "2rem",
                borderBottom: "2px solid #F99D07",
                paddingBottom: "1rem"
            }}>
                <button
                    onClick={onBack}
                    style={{
                        backgroundColor: "#F99D07",
                        color: "#FDFDFD",
                        border: "none",
                        padding: "0.5rem 1rem",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginRight: "1rem",
                        fontSize: "1rem"
                    }}
                >
                    ← Back to List
                </button>
                <div>
                    <h1 style={{ margin: 0, color: "#FDFDFD" }}>{problem.name}</h1>
                    <p style={{ 
                        margin: "0.5rem 0", 
                        color: "#AAAAAA", 
                        fontSize: "1rem" 
                    }}>
                        {problem.section}
                    </p>
                    <p style={{ 
                        margin: "0", 
                        color: "#FDFDFD", 
                        fontSize: "0.9rem" 
                    }}>
                        {formatDate(problem.dateAdded)}
                    </p>
                </div>
            </div>

            {/* Notes Section */}
            <div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
                    <h2 style={{ color: "#FDFDFD", margin: 0, marginRight: "1rem" }}>Notes</h2>
                    {isSaving && (
                        <span style={{ color: "#F99D07", fontSize: "0.9rem" }}>
                            Saving...
                        </span>
                    )}
                </div>
                <textarea
                    value={notes}
                    onChange={handleNotesChange}
                    placeholder="Write your notes about this problem here..."
                    style={{
                        width: "100%",
                        height: "400px",
                        padding: "1rem",
                        border: "2px solid #F99D07",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        fontFamily: "Arial, sans-serif",
                        resize: "vertical",
                        outline: "none",
                        boxSizing: "border-box",
                        backgroundColor: "#2a2a2a",
                        color: "#FDFDFD"
                    }}
                />
            </div>
        </div>
    );
}

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState("list");
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [tasks, setTasks] = useState({});

    // Check if user is already logged in when app loads
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Verify token and load user data
            loadUserData();
        } else {
            setIsLoading(false);
        }
    }, []);

    const loadUserData = async () => {
        try {
            const response = await ApiService.getProblems();
            setTasks(response.tasks);
            
            // Set a basic user object (you might want to store user info separately)
            const user = { 
                email: 'current-user@example.com', // You'll need to get this from token or separate API call
                firstName: 'User', 
                lastName: 'Name',
                tasks: response.tasks 
            };
            setCurrentUser(user);
        } catch (error) {
            console.error('Failed to load user data:', error);
            // Token might be invalid, clear it
            ApiService.removeToken();
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (email, password) => {
        try {
            const response = await ApiService.login(email, password);
            if (response.success) {
                const user = {
                    email: response.user.email,
                    firstName: response.user.firstName,
                    lastName: response.user.lastName,
                    tasks: {}
                };
                setCurrentUser(user);
                
                // Load user's problems
                await loadUserData();
                
                return { success: true };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const handleSignup = async (email, password, firstName, lastName) => {
        try {
            const response = await ApiService.signup(email, password, firstName, lastName);
            if (response.success) {
                const user = {
                    email: response.user.email,
                    firstName: response.user.firstName,
                    lastName: response.user.lastName,
                    tasks: {}
                };
                setCurrentUser(user);
                
                // Initialize empty tasks structure
                const sections = [
                    "Arrays", "Two Pointers", "Stack", "Binary Search", 
                    "Sliding Window", "Linked List", "Trees", "Back Tracking", "DP"
                ];
                const emptyTasks = sections.reduce((acc, section) => {
                    acc[section] = [];
                    return acc;
                }, {});
                setTasks(emptyTasks);
                
                return { success: true };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const handleLogout = () => {
        ApiService.logout();
        setCurrentUser(null);
        setTasks({});
        setCurrentView("list");
        setSelectedProblem(null);
    };

    const updateUserTasks = (newTasks) => {
        setTasks(newTasks);
        // Update current user state
        const updatedUser = { ...currentUser, tasks: newTasks };
        setCurrentUser(updatedUser);
    };

    const navigateToProblem = (problemName, section, problemIndex) => {
        const problem = tasks[section][problemIndex];
        setSelectedProblem({ 
            ...problem, 
            section, 
            index: problemIndex 
        });
        setCurrentView("problem");
    };

    const navigateToList = () => {
        setCurrentView("list");
        setSelectedProblem(null);
    };

    const updateProblemNotes = (notes) => {
        if (!selectedProblem) return;
        
        const { section, index } = selectedProblem;
        const updatedTasks = { ...tasks };
        updatedTasks[section][index] = {
            ...updatedTasks[section][index],
            notes: notes
        };
        
        updateUserTasks(updatedTasks);
        setSelectedProblem({ ...selectedProblem, notes });
    };

    const updateProblemStatus = async (section, index, newStatus) => {
        try {
            const problem = tasks[section][index];
            await ApiService.updateProblem(problem.id, {
                name: problem.name,
                difficulty: problem.difficulty,
                status: newStatus,
                notes: problem.notes
            });

            const updatedTasks = { ...tasks };
            updatedTasks[section][index] = {
                ...updatedTasks[section][index],
                status: newStatus
            };
            updateUserTasks(updatedTasks);
        } catch (error) {
            console.error('Failed to update problem status:', error);
        }
    };

    if (isLoading) {
        return (
            <div style={{ 
                textAlign: 'center', 
                marginTop: '2rem',
                color: '#333',
                fontSize: '1.2rem'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <div>
            {currentUser ? (
                currentView === "list" ? (
                    <ToDoList 
                        user={{ ...currentUser, tasks }}
                        onTasksUpdate={updateUserTasks}
                        onLogout={handleLogout}
                        onProblemClick={navigateToProblem}
                        onStatusUpdate={updateProblemStatus}
                    />
                ) : (
                    <ProblemDetails 
                        problem={selectedProblem}
                        onBack={navigateToList}
                        onNotesUpdate={updateProblemNotes}
                    />
                )
            ) : (
                <Login 
                    onLogin={handleLogin}
                    onSignup={handleSignup}
                />
            )}
        </div>
    );
}

export default App;