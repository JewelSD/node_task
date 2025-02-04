const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "temp"))); //HTML files

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "node_db"
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed: " + err.message);
    } else {
        console.log("Connected to MySQL database");
    }
});


app.all("/api/calculate", (req, res) => {
    if (req.method === "POST") {
        // Store numbers in MySQL
        let num1 = parseFloat(req.body.num1);
        let num2 = parseFloat(req.body.num2);

        if (isNaN(num1) || isNaN(num2)) {
            return res.send("Invalid input! Please enter valid numbers.");
        }

        const query = "INSERT INTO numbers (num1, num2) VALUES (?, ?)";
        db.query(query, [num1, num2], (err, result) => {
            if (err) {
                console.error("Error inserting data: " + err.message);
                return res.send("Database error!");
            }
            res.send("Values stored successfully!");
        });

    } else if (req.method === "GET") {
        // Fetch the last entry and hash it
        const query = "SELECT num1, num2 FROM numbers ORDER BY id DESC LIMIT 1";

        db.query(query, (err, result) => {
            if (err) {
                console.error("Error fetching data: " + err.message);
                return res.status(500).send("Database error!");
            }

            if (result.length === 0) {
                return res.send("No data found in the database.");
            }

            const { num1, num2 } = result[0];
            const concatenated = `${num1}${num2}`;

            // Hash the concatenated string using SHA-256
            const hash = crypto.createHash("sha256").update(concatenated).digest("hex");

            res.send(`Concatenated: ${concatenated} <br> SHA-256 Hash: ${hash}`);
        });

    } else {
        res.status(405).send("Method Not Allowed");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
