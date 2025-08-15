const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();

app.use(cors());

// Define a basic route
app.get('/', (req, res) => {
    res.send('Welcome to the server!');
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});