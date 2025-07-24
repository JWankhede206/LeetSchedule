const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();

app.use(cors());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "DSA"
});



app.get("/", (req, res) => {
    const sql = "SELECT * FROM student";
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            res.json(result);
        }
    });
}); 

app.listen(8000, () => {
    console.log('Listening');
});

