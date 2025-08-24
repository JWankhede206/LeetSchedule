import React, { useState } from "react";
import ApiService from "./api";

function ToDoList({ user, onTasksUpdate, onLogout, onProblemClick, onStatusUpdate, onSettingsClick}) {

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

    const initializeTasks = (userTasks) => {
        const initialized = sections.reduce((acc, section) => {
            acc[section] = userTasks?.[section] || [];
            return acc;
        }, {});
        return initialized;
    };

    const [tasks, setTasks] = useState(() => initializeTasks(user.tasks));

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
            acc[section] = { name: "", difficulty: "Easy", status: "Attempted" };
            return acc;
        }, {})
    );

    const [editingTask, setEditingTask] = useState(null);
    const [editTask, setEditTask] = useState({ name: "", difficulty: "Easy", status: "Attempted" });

    React.useEffect(() => {
        setTasks(initializeTasks(user.tasks));
    }, [user.tasks]);

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

    function handleStatusChange(event, section) {
        setNewTask({
            ...newTask,
            [section]: { ...newTask[section], status: event.target.value },
        });
    }

    function startEditing(section, index) {
        const task = tasks[section][index];
        setEditingTask({ section, index });
        setEditTask({ 
            name: task.name, 
            difficulty: task.difficulty, 
            status: task.status 
        });
    }

    function cancelEditing() {
        setEditingTask(null);
        setEditTask({ name: "", difficulty: "Easy", status: "Attempted" });
    }

    async function saveEdit() {
        if (editTask.name.trim() !== "" && editingTask) {
            const { section, index } = editingTask;
            const task = tasks[section][index];
            
            try {
                await ApiService.updateProblem(task.id, {
                    name: editTask.name,
                    difficulty: editTask.difficulty,
                    status: editTask.status,
                    notes: task.notes || ""
                });

                const updatedTasks = { ...tasks };
                updatedTasks[section][index] = {
                    ...updatedTasks[section][index],
                    name: editTask.name,
                    difficulty: editTask.difficulty,
                    status: editTask.status
                };
                updateTasks(updatedTasks);
                setEditingTask(null);
                setEditTask({ name: "", difficulty: "Easy", status: "Attempted" });
            } catch (error) {
                console.error('Failed to update problem:', error);
                alert('Failed to update problem. Please try again.');
            }
        }
    }

    function handleEditNameChange(event) {
        setEditTask({ ...editTask, name: event.target.value });
    }

    function handleEditDifficultyChange(event) {
        setEditTask({ ...editTask, difficulty: event.target.value });
    }

    function handleEditStatusChange(event) {
        setEditTask({ ...editTask, status: event.target.value });
    }

    async function saveTask(section) {
        if (newTask[section].name.trim() !== "") {
            try {
                const response = await ApiService.createProblem({
                    name: newTask[section].name,
                    section: section,
                    difficulty: newTask[section].difficulty,
                    status: newTask[section].status
                });

                if (response.success) {
                    const taskWithDate = {
                        id: response.problem.id,
                        name: newTask[section].name,
                        difficulty: newTask[section].difficulty,
                        status: newTask[section].status,
                        dateAdded: response.problem.dateAdded,
                        notes: ""
                    };
                    
                    const updatedTasks = {
                        ...tasks,
                        [section]: [...(tasks[section] || []), taskWithDate],
                    };
                    updateTasks(updatedTasks);
                    
                    setNewTask({
                        ...newTask,
                        [section]: { name: "", difficulty: "Easy", status: "Attempted" },
                    });
                    setShowForm({ ...showForm, [section]: false });
                }
            } catch (error) {
                console.error('Failed to save problem:', error);
                alert('Failed to save problem. Please try again.');
            }
        }
    }

    async function deleteTask(section, index) {
        const task = tasks[section][index];
        
        try {
            await ApiService.deleteProblem(task.id);
            
            const updatedTasksForSection = (tasks[section] || []).filter((_, i) => i !== index);
            const updatedTasks = { ...tasks, [section]: updatedTasksForSection };
            updateTasks(updatedTasks);
            
            if (editingTask && editingTask.section === section && editingTask.index === index) {
                cancelEditing();
            }
            else if (editingTask && editingTask.section === section && editingTask.index > index) {
                setEditingTask({ ...editingTask, index: editingTask.index - 1 });
            }
        } catch (error) {
            console.error('Failed to delete problem:', error);
            alert('Failed to delete problem. Please try again.');
        }
    }

    function getDifficultyStyle(difficulty) {
        switch (difficulty) {
            case "Easy":
                return { color: "#4CAF50", fontWeight: "bold" };
            case "Medium":
                return { color: "orange", fontWeight: "bold" };
            case "Hard":
                return { color: "red", fontWeight: "bold" };
            default:
                return {};
        }
    }

    function getStatusStyle(status) {
        switch (status) {
            case "Attempted":
                return { color: "#F99D07", fontWeight: "bold" };
            case "Solved":
                return { color: "#4CAF50", fontWeight: "bold" };
            default:
                return {};
        }
    }

    const calculateReviewDate = (dateAdded, status) => {
        const addedDate = new Date(dateAdded);
        const reviewDays = status === "Solved" 
            ? (user.userSettings?.solvedReviewDays || user.solvedReviewDays || 5)
            : (user.userSettings?.attemptedReviewDays || user.attemptedReviewDays || 3);
        const reviewDate = new Date(addedDate);
        reviewDate.setDate(addedDate.getDate() + reviewDays);
        return reviewDate;
    };

    const getPriorityProblems = () => {
        const allProblems = [];
        
        Object.keys(tasks).forEach(section => {
            (tasks[section] || []).forEach((task, index) => {
                const reviewDate = calculateReviewDate(task.dateAdded, task.status);
                allProblems.push({
                    ...task,
                    section,
                    index,
                    reviewDate,
                    isOverdue: reviewDate < new Date()
                });
            });
        });

        return allProblems.sort((a, b) => a.reviewDate - b.reviewDate);
    };

    const formatReviewDate = (date) => {
        const today = new Date();
        const diffTime = date - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return `${Math.abs(diffDays)} days overdue`;
        } else if (diffDays === 0) {
            return "Due today";
        } else {
            return `In ${diffDays} days`;
        }
    };

    const getQueueStatusColor = (status) => {
        return status === "Solved" ? "#4CAF50" : "#F99D07";
    };

    const getQueueDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case "Easy": return "#4CAF50";
            case "Medium": return "orange";
            case "Hard": return "red";
            default: return "#333333";
        }
    };

    const priorityProblems = getPriorityProblems();
    const todayProblems = priorityProblems.filter(p => p.isOverdue || 
        Math.ceil((p.reviewDate - new Date()) / (1000 * 60 * 60 * 24)) <= 0
    );

    return (
        <div>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 2rem",
                backgroundColor: "#F99D07",
                marginBottom: "2rem",
                width: "100%",
                boxSizing: "border-box"
            }}>
                <div>
                    <h1 style={{ margin: 0, color: "#FDFDFD" }}>
                        Completed Problems
                    </h1>
                    <p style={{ margin: "0.5rem 0 0 0", color: "#FDFDFD", opacity: 0.9 }}>
                        Welcome back, {user.firstName}
                    </p>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                        onClick={onSettingsClick}
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
                        ⚙️ Settings
                    </button>
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
            </div>
    
            <div style={{
                display: "flex",
                gap: "2rem",
                padding: "0 2rem",
                minHeight: "100vh"
            }}>
                <div style={{ flex: 1 }}>
                    {sections.map((section) => (
                    <div key={section} style={{ marginBottom: "2rem" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                backgroundColor: "#F99D07",
                                color: "#FDFDFD",
                                padding: "0.5rem 1rem",
                                borderRadius: "5px",
                                width: "520px",
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
    
                        {!collapsed[section] && (
                            <div>
                                {showForm[section] && (
                                    <div
                                        style={{
                                            marginLeft: "1rem",
                                            marginTop: "1rem",
                                            width: "520px",
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
                                                width: "40%",
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
                                        <select
                                            value={newTask[section].status}
                                            onChange={(e) => handleStatusChange(e, section)}
                                            style={{
                                                padding: "0.3rem",
                                                borderRadius: "5px",
                                                border: "1px solid #F99D07",
                                                marginRight: "0.5rem",
                                            }}
                                        >
                                            <option value="Attempted">Attempted</option>
                                            <option value="Solved">Solved</option>
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
    
                                {(tasks[section] || []).length > 0 && (
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "180px 70px 70px 60px auto",
                                            alignItems: "center",
                                            backgroundColor: "#1a1a1a",
                                            color: "#FDFDFD",
                                            padding: "0.5rem 1rem",
                                            borderRadius: "5px",
                                            width: "520px",
                                            marginLeft: "2rem",
                                            marginTop: "1rem",
                                            border: "2px solid #F99D07",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        <div>Problem</div>
                                        <div style={{ textAlign: "center" }}>Difficulty</div>
                                        <div style={{ textAlign: "center" }}>Status</div>
                                        <div style={{ textAlign: "center" }}>Edit</div>
                                        <div style={{ textAlign: "right" }}>Delete</div>
                                    </div>
                                )}
    
                                <ul
                                    style={{
                                        listStyleType: "none",
                                        padding: 0,
                                        marginLeft: "2rem",
                                        width: "520px",
                                    }}
                                >
                                    {(tasks[section] || []).map((task, index) => {
                                        const isEditing = editingTask && editingTask.section === section && editingTask.index === index;
                                        
                                        return (
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
                                                    gridTemplateColumns: "180px 70px 70px 60px auto",
                                                    alignItems: "center",
                                                    gap: "0.25rem"
                                                }}
                                            >
                                                {isEditing ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            value={editTask.name}
                                                            onChange={handleEditNameChange}
                                                            style={{
                                                                width: "100%",
                                                                padding: "0.2rem",
                                                                borderRadius: "3px",
                                                                border: "1px solid #F99D07",
                                                                fontSize: "0.9rem"
                                                            }}
                                                        />
                                                        <select
                                                            value={editTask.difficulty}
                                                            onChange={handleEditDifficultyChange}
                                                            style={{
                                                                padding: "0.2rem",
                                                                borderRadius: "3px",
                                                                border: "1px solid #F99D07",
                                                                fontSize: "0.8rem"
                                                            }}
                                                        >
                                                            <option value="Easy">Easy</option>
                                                            <option value="Medium">Medium</option>
                                                            <option value="Hard">Hard</option>
                                                        </select>
                                                        <select
                                                            value={editTask.status}
                                                            onChange={handleEditStatusChange}
                                                            style={{
                                                                padding: "0.2rem",
                                                                borderRadius: "3px",
                                                                border: "1px solid #F99D07",
                                                                fontSize: "0.8rem"
                                                            }}
                                                        >
                                                            <option value="Attempted">Attempted</option>
                                                            <option value="Solved">Solved</option>
                                                        </select>
                                                        <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                                                            <button
                                                                onClick={saveEdit}
                                                                style={{
                                                                    backgroundColor: "#4CAF50",
                                                                    color: "#FDFDFD",
                                                                    border: "none",
                                                                    padding: "0.2rem 0.4rem",
                                                                    borderRadius: "3px",
                                                                    cursor: "pointer",
                                                                    fontSize: "0.7rem"
                                                                }}
                                                            >
                                                                ✓
                                                            </button>
                                                            <button
                                                                onClick={cancelEditing}
                                                                style={{
                                                                    backgroundColor: "#f44336",
                                                                    color: "#FDFDFD",
                                                                    border: "none",
                                                                    padding: "0.2rem 0.4rem",
                                                                    borderRadius: "3px",
                                                                    cursor: "pointer",
                                                                    fontSize: "0.7rem"
                                                                }}
                                                            >
                                                                ✗
                                                            </button>
                                                        </div>
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
                                                            ⌫
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
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
                                                        <span
                                                            style={{
                                                                ...getStatusStyle(task.status),
                                                                textAlign: "center",
                                                            }}
                                                        >
                                                            {task.status}
                                                        </span>
                                                        <button
                                                            onClick={() => startEditing(section, index)}
                                                            style={{
                                                                backgroundColor: "#2196F3",
                                                                color: "#FDFDFD",
                                                                border: "none",
                                                                padding: "0.2rem 0.4rem",
                                                                borderRadius: "3px",
                                                                cursor: "pointer",
                                                                fontSize: "0.8rem",
                                                                justifySelf: "center"
                                                            }}
                                                        >
                                                            ✎
                                                        </button>
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
                                                            ⌫
                                                        </button>
                                                    </>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
    
                <div style={{
                    position: "sticky",
                    top: "2rem",
                    alignSelf: "flex-start",
                    marginTop: "2rem"
                }}>
                <div style={{
                    width: "400px",
                    height: "550px",
                    backgroundColor: "#f5f5f5",
                    border: "2px solid #F99D07",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <div style={{
                        backgroundColor: "#F99D07",
                        color: "#FDFDFD",
                        padding: "1rem",
                        borderRadius: "6px 6px 0 0",
                        textAlign: "center"
                    }}>
                        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Review Queue</h3>
                        <p style={{ margin: "0.3rem 0 0 0", fontSize: "0.8rem", opacity: 0.9 }}>
                            {priorityProblems.filter(p => p.isOverdue).length} overdue • {priorityProblems.length} total
                        </p>
                    </div>
    
                    {todayProblems.length === 0 && priorityProblems.length > 0 && (
                        <div style={{
                            padding: "1rem",
                            textAlign: "center",
                            backgroundColor: "#e8f5e8",
                            margin: "0.75rem",
                            borderRadius: "6px",
                            border: "1px solid #4CAF50"
                        }}>
                            <div style={{
                                color: "#2e7d32",
                                fontWeight: "bold",
                                fontSize: "0.9rem",
                                marginBottom: "0.25rem"
                            }}>
                                🎉 You are all caught up!
                            </div>
                            <div style={{
                                color: "#4a6b4d",
                                fontSize: "0.75rem"
                            }}>
                                No problems due today
                            </div>
                        </div>
                    )}
    
                    <div style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "1rem"
                    }}>
                        {priorityProblems.length === 0 ? (
                            <div style={{
                                color: "#666666",
                                textAlign: "center",
                                marginTop: "1.5rem",
                                fontSize: "0.9rem"
                            }}>
                                No problems to review yet.
                                <br />
                                Add some problems!
                            </div>
                        ) : (
                            priorityProblems.slice(0, 8).map((problem, index) => (
                                <div
                                    key={`${problem.section}-${problem.index}`}
                                    onClick={() => onProblemClick(problem.name, problem.section, problem.index)}
                                    style={{
                                        backgroundColor: problem.isOverdue ? "#ffebee" : "#ffffff",
                                        border: problem.isOverdue ? "1px solid #f44336" : "1px solid #cccccc",
                                        borderRadius: "4px",
                                        padding: "0.75rem",
                                        marginBottom: "0.75rem",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        position: "relative",
                                        fontSize: "0.85rem",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = problem.isOverdue ? "#ffcdd2" : "#f5f5f5";
                                        e.target.style.transform = "translateX(2px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = problem.isOverdue ? "#ffebee" : "#ffffff";
                                        e.target.style.transform = "translateX(0)";
                                    }}
                                >
                                    <div style={{
                                        position: "absolute",
                                        top: "0.5rem",
                                        right: "0.5rem",
                                        backgroundColor: problem.isOverdue ? "#f44336" : "#F99D07",
                                        color: "#FDFDFD",
                                        borderRadius: "50%",
                                        width: "18px",
                                        height: "18px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.7rem",
                                        fontWeight: "bold"
                                    }}>
                                        {index + 1}
                                    </div>
    
                                    <div style={{
                                        color: "#333333",
                                        fontWeight: "bold",
                                        fontSize: "0.9rem",
                                        marginBottom: "0.4rem",
                                        paddingRight: "25px",
                                        wordWrap: "break-word",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                    }}>
                                        {problem.name}
                                    </div>
    
                                    <div style={{
                                        color: "#666666",
                                        fontSize: "0.75rem",
                                        marginBottom: "0.4rem"
                                    }}>
                                        {problem.section}
                                    </div>
    
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "0.4rem"
                                    }}>
                                        <span style={{
                                            color: getQueueStatusColor(problem.status),
                                            fontSize: "0.75rem",
                                            fontWeight: "bold"
                                        }}>
                                            {problem.status}
                                        </span>
                                        <span style={{
                                            color: getQueueDifficultyColor(problem.difficulty),
                                            fontSize: "0.75rem",
                                            fontWeight: "bold"
                                        }}>
                                            {problem.difficulty}
                                        </span>
                                    </div>
    
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}>
                                        <div style={{
                                            color: problem.isOverdue ? "#f44336" : "#F99D07",
                                            fontSize: "0.75rem",
                                            fontWeight: problem.isOverdue ? "bold" : "normal"
                                        }}>
                                            {formatReviewDate(problem.reviewDate)}
                                        </div>
                                        
                                        {problem.status === "Attempted" && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onStatusUpdate(problem.section, problem.index, "Solved");
                                                }}
                                                style={{
                                                    backgroundColor: "#4CAF50",
                                                    color: "#FDFDFD",
                                                    border: "none",
                                                    borderRadius: "3px",
                                                    padding: "0.2rem 0.4rem",
                                                    fontSize: "0.65rem",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                ✓ Solved
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        
                        {priorityProblems.length > 8 && (
                            <div style={{
                                textAlign: "center",
                                color: "#666666",
                                fontSize: "0.75rem",
                                marginTop: "0.5rem",
                                fontStyle: "italic"
                            }}>
                                +{priorityProblems.length - 8} more problems...
                            </div>
                        )}
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}
export default ToDoList;