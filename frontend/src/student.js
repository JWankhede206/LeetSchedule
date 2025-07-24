import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Student() {
    const [students, setStudents] = useState([]);
    
    useEffect(() => {
        axios.get('http://localhost:8000/')
        .then((response) => {
            console.log(response);
            setStudents(response.data);
        })
        .catch((error) => {
            console.error('error fetching the data!', error);
        });
    }, [])
    
    return (
        <div className='d-flex vh-100 bg-primary justify-content-center align-items-center'>
            <div className='w-50 bg-white rounded p-3'>
                <button className='btn btn-success mb-3'>Add+</button>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Student</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => (
                            <tr key={index}>
                                <td>{student.id}</td>
                                <td>{student.name}</td>
                                <td>{student.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Student;