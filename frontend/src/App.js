import React, { useState, useEffect } from "react";
import ToDoList from "./ToDoList";
import Login from "./Login";

function ProblemDetails({ problem, onBack, onNotesUpdate }) {
    const [notes, setNotes] = useState(problem.notes || "");

    const handleNotesChange = (e) => {
        const newNotes = e.target.value;
        setNotes(newNotes);
        onNotesUpdate(newNotes);
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
                <h2 style={{ color: "#FDFDFD", marginBottom: "1rem" }}>Notes</h2>
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

    // Check if user is already logged in when app loads
    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            // Ensure all tasks have status field for backwards compatibility
            if (user.tasks) {
                Object.keys(user.tasks).forEach(section => {
                    user.tasks[section] = user.tasks[section].map(task => ({
                        ...task,
                        status: task.status || "Attempted" // Default to Attempted if not set
                    }));
                });
            }
            setCurrentUser(user);
        }
        setIsLoading(false);
    }, []);

    const handleLogin = (email, password) => {
        // Get existing users from localStorage
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        
        // Check if user exists and password matches
        if (users[email] && users[email].password === password) {
            const user = { 
                email, 
                firstName: users[email].firstName,
                lastName: users[email].lastName,
                tasks: users[email].tasks || {} 
            };
            
            // Ensure all tasks have status field for backwards compatibility
            if (user.tasks) {
                Object.keys(user.tasks).forEach(section => {
                    user.tasks[section] = user.tasks[section].map(task => ({
                        ...task,
                        status: task.status || "Attempted" // Default to Attempted if not set
                    }));
                });
            }
            
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            return { success: true };
        } else {
            return { success: false, message: "Invalid email or password" };
        }
    };

    const handleSignup = (email, password, firstName, lastName) => {
        // Get existing users from localStorage
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        
        // Check if user already exists
        if (users[email]) {
            return { success: false, message: "User already exists" };
        }
        
        // Create new user
        const sections = [
            "Arrays", "Two Pointers", "Stack", "Binary Search", 
            "Sliding Window", "Linked List", "Trees", "Back Tracking", "DP"
        ];
        
        const emptyTasks = sections.reduce((acc, section) => {
            acc[section] = [];
            return acc;
        }, {});
        
        users[email] = { 
            password,
            firstName,
            lastName,
            tasks: emptyTasks 
        };
        
        localStorage.setItem('users', JSON.stringify(users));
        
        const user = { email, firstName, lastName, tasks: emptyTasks };
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        return { success: true };
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
    };

    const updateUserTasks = (newTasks) => {
        // Update current user state
        const updatedUser = { ...currentUser, tasks: newTasks };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Update in users database
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[currentUser.email]) {
            users[currentUser.email].tasks = newTasks;
            localStorage.setItem('users', JSON.stringify(users));
        }
    };

    const navigateToProblem = (problemName, section, problemIndex) => {
        const problem = currentUser.tasks[section][problemIndex];
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
        const updatedTasks = { ...currentUser.tasks };
        updatedTasks[section][index] = {
            ...updatedTasks[section][index],
            notes: notes
        };
        
        updateUserTasks(updatedTasks);
        setSelectedProblem({ ...selectedProblem, notes });
    };

    const updateProblemStatus = (section, index, newStatus) => {
        const updatedTasks = { ...currentUser.tasks };
        updatedTasks[section][index] = {
            ...updatedTasks[section][index],
            status: newStatus
        };
        updateUserTasks(updatedTasks);
    };

    if (isLoading) {
        return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
    }

    return (
        <div>
            {currentUser ? (
                currentView === "list" ? (
                    <ToDoList 
                        user={currentUser}
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