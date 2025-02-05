const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "temp"))); // html files

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

// form submission
app.post("/api/calculate", (req, res) => {
    const { num1, num2 } = req.body;

    if (!num1 || !num2) {
        return res.send("Both numbers are required.");
    }

    const query = "INSERT INTO numbers (num1, num2) VALUES (?, ?)";
    db.query(query, [num1, num2], (err, result) => {
        if (err) {
            console.error("Error inserting data: " + err.message);
            return res.send("Database error!");
        }
        res.send("Values stored successfully!");
    });
});


// Fetch last entry
app.get("/api/hash-latest", (req, res) => {
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
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
