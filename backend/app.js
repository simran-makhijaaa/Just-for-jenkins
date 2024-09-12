const express = require('express');
const mysql = require('mysql');
const axios = require('axios');

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to the database
db.connect(err => {
  if (err) {
    console.error('Could not connect to the database:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL');

  // Create the `users` table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL
    )
  `;

  db.query(createTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating table:', err);
      process.exit(1);
    }
    console.log('Users table ready');
  });
});

app.use(express.static('public'));

// Endpoint to fetch a random user and insert into the database
app.get('/fetch-user', async (req, res) => {
  try {
    const { data } = await axios.get('https://randomuser.me/api/');
    const user = data.results[0];
    const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
    db.query(sql, [user.name.first + ' ' + user.name.last, user.email], (err, result) => {
      if (err) throw err;
      res.send('User added to database');
    });
  } catch (err) {
    res.status(500).send('Error fetching user');
  }
});

// Endpoint to get all users from the database
app
