import React, { useState } from "react";

function ToDoList({ user, onTasksUpdate, onLogout, onProblemClick }) {
    const sections = [
        "Arrays",
        "Two Pointers",
        "Stack",
        "Binary Search",
        "Sliding Window",
        "Linked List",
        "Trees",
        "Back Tracking",
        "DP",
    ];

    const [tasks, setTasks] = useState(user.tasks || 
        sections.reduce((acc, section) => {
            acc[section] = [];
            return acc;
        }, {})
    );

    const [showForm, setShowForm] = useState(
        sections.reduce((acc, section) => {
            acc[section] = false;
            return acc;
        }, {})
    );

    const [collapsed, setCollapsed] = useState(
        sections.reduce((acc, section) => {
            acc[section] = false;
            return acc;
        }, {})
    );

    const [newTask, setNewTask] = useState(
        sections.reduce((acc, section) => {
            acc[section] = { name: "", difficulty: "Easy" };
            return acc;
        }, {})
    );

    // Update tasks and sync with parent component
    const updateTasks = (newTasks) => {
        setTasks(newTasks);
        onTasksUpdate(newTasks);
    };

    function toggleForm(section) {
        setShowForm({ ...showForm, [section]: !showForm[section] });
    }

    function toggleCollapse(section) {
        setCollapsed({ ...collapsed, [section]: !collapsed[section] });
    }

    function handleNameChange(event, section) {
        setNewTask({
            ...newTask,
            [section]: { ...newTask[section], name: event.target.value },
        });
    }

    function handleDifficultyChange(event, section) {
        setNewTask({
            ...newTask,
            [section]: { ...newTask[section], difficulty: event.target.value },
        });
    }

    function saveTask(section) {
        if (newTask[section].name.trim() !== "") {
            const taskWithDate = {
                ...newTask[section],
                dateAdded: new Date().toISOString(),
                notes: ""
            };
            
            const updatedTasks = {
                ...tasks,
                [section]: [...tasks[section], taskWithDate],
            };
            updateTasks(updatedTasks);
            
            // Get the index of the newly added task
            const newTaskIndex = tasks[section].length;
            
            setNewTask({
                ...newTask,
                [section]: { name: "", difficulty: "Easy" },
            });
            setShowForm({ ...showForm, [section]: false });
            
            // Navigate to the problem details page immediately with the problem data
            onProblemClick(taskWithDate.name, section, newTaskIndex, taskWithDate);
        }
    }

    function deleteTask(section, index) {
        const updatedTasksForSection = tasks[section].filter((_, i) => i !== index);
        const updatedTasks = { ...tasks, [section]: updatedTasksForSection };
        updateTasks(updatedTasks);
    }

    function getDifficultyStyle(difficulty) {
        switch (difficulty) {
            case "Easy":
                return { color: "green", fontWeight: "bold" };
            case "Medium":
                return { color: "orange", fontWeight: "bold" };
            case "Hard":
                return { color: "red", fontWeight: "bold" };
            default:
                return {};
        }
    }

    return (
        <div>
            {/* Header with user info and logout */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 2rem",
                backgroundColor: "#F99D07",
                marginBottom: "2rem"
            }}>
                <div>
                    <h1 style={{ margin: 0, color: "#FDFDFD" }}>
                        Completed Problems
                    </h1>
                    <p style={{ margin: "0.5rem 0 0 0", color: "#FDFDFD", opacity: 0.9 }}>
                        Welcome back, {user.firstName}
                    </p>
                </div>
                <button
                    onClick={onLogout}
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
                    Logout
                </button>
            </div>

            {sections.map((section) => (
                <div key={section} style={{ marginBottom: "2rem" }}>
                    {/* Section Header */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            backgroundColor: "#F99D07",
                            color: "#FDFDFD",
                            padding: "0.5rem 1rem",
                            borderRadius: "5px",
                            width: "500px",
                            marginLeft: "1rem",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <button
                                onClick={() => toggleCollapse(section)}
                                style={{
                                    backgroundColor: "transparent",
                                    color: "#FDFDFD",
                                    border: "none",
                                    padding: "0.2rem",
                                    marginRight: "0.5rem",
                                    cursor: "pointer",
                                    fontSize: "1rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {collapsed[section] ? "▶" : "▼"}
                            </button>
                            <h2 style={{ margin: 0 }}>{section}</h2>
                        </div>
                        <button
                            onClick={() => toggleForm(section)}
                            style={{
                                backgroundColor: "#FDFDFD",
                                color: "#F99D07",
                                border: "1px solid #F99D07",
                                padding: "0.5rem 1rem",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                        >
                            Add
                        </button>
                    </div>

                    {/* Collapsible Content */}
                    {!collapsed[section] && (
                        <div>
                            {/* Add Task Form */}
                            {showForm[section] && (
                                <div
                                    style={{
                                        marginLeft: "1rem",
                                        marginTop: "1rem",
                                        width: "500px",
                                        backgroundColor: "#FDFDFD",
                                        padding: "0.5rem",
                                        borderRadius: "5px",
                                        border: "1px solid #F99D07",
                                    }}
                                >
                                    <input
                                        type="text"
                                        value={newTask[section].name}
                                        onChange={(e) => handleNameChange(e, section)}
                                        placeholder="Problem name"
                                        style={{
                                            width: "60%",
                                            padding: "0.3rem",
                                            marginBottom: "0.5rem",
                                            borderRadius: "5px",
                                            border: "1px solid #F99D07",
                                            marginRight: "0.5rem",
                                        }}
                                    />
                                    <select
                                        value={newTask[section].difficulty}
                                        onChange={(e) => handleDifficultyChange(e, section)}
                                        style={{
                                            padding: "0.3rem",
                                            borderRadius: "5px",
                                            border: "1px solid #F99D07",
                                            marginRight: "0.5rem",
                                        }}
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                    <button
                                        onClick={() => saveTask(section)}
                                        style={{
                                            backgroundColor: "#F99D07",
                                            color: "#FDFDFD",
                                            border: "none",
                                            padding: "0.5rem 1rem",
                                            borderRadius: "5px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Save
                                    </button>
                                </div>
                            )}

                            {/* Column Headers */}
                            {tasks[section].length > 0 && (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "250px 100px auto",
                                        alignItems: "center",
                                        backgroundColor: "#1a1a1a",
                                        color: "#FDFDFD",
                                        padding: "0.5rem 1rem",
                                        borderRadius: "5px",
                                        width: "500px",
                                        marginLeft: "2rem",
                                        marginTop: "1rem",
                                        border: "2px solid #F99D07",
                                        fontWeight: "bold",
                                    }}
                                >
                                    <div>Problem</div>
                                    <div style={{ textAlign: "center" }}>Difficulty</div>
                                    <div style={{ textAlign: "right" }}>Delete</div>
                                </div>
                            )}

                            {/* Task List */}
                            <ul
                                style={{
                                    listStyleType: "none",
                                    padding: 0,
                                    marginLeft: "2rem",
                                    width: "500px",
                                }}
                            >
                                {tasks[section].map((task, index) => (
                                    <li
                                        key={index}
                                        style={{
                                            backgroundColor: "#1a1a1a",
                                            color: "#FDFDFD",
                                            padding: "0.5rem",
                                            marginBottom: "0.5rem",
                                            borderRadius: "5px",
                                            border: "1px solid #F99D07",
                                            display: "grid",
                                            gridTemplateColumns: "250px 100px auto",
                                            alignItems: "center",
                                        }}
                                    >
                                        <span
                                            onClick={() => onProblemClick(task.name, section, index)}
                                            style={{
                                                maxWidth: "100%",
                                                overflowX: "auto",
                                                whiteSpace: "nowrap",
                                                textOverflow: "ellipsis",
                                                paddingRight: "0.5rem",
                                                cursor: "pointer",
                                                textDecoration: "underline",
                                                color: "#FDFDFD"
                                            }}
                                        >
                                            {task.name}
                                        </span>
                                        <span
                                            style={{
                                                ...getDifficultyStyle(task.difficulty),
                                                textAlign: "center",
                                            }}
                                        >
                                            {task.difficulty}
                                        </span>
                                        <button
                                            onClick={() => deleteTask(section, index)}
                                            style={{
                                                backgroundColor: "#F99D07",
                                                color: "#FDFDFD",
                                                border: "none",
                                                padding: "0.3rem 0.5rem",
                                                borderRadius: "5px",
                                                cursor: "pointer",
                                                justifySelf: "end",
                                            }}
                                        >
                                            ❌
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default ToDoList;