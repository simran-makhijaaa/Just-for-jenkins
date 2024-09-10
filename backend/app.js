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


db.connect(err => {
 if (err) {
    console.error('Could not connect to the database:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL');
});

app.use(express.static('public'));

app.get('/fetch-user', async (req, res) => {
      try{ 
	const { data } = await axios.get('https://randomuser.me/api/');
	 const user = data.results[0];
         const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
         db.query(sql, [user.name.first + ' ' + user.name.last, user.email], (err, result) => {
           if (err) throw err;
           res.send('User added to database');
         });
      } catch (err){ 
	res.status(500).send('Error fetching user');
  }
});

app.get('/users', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).send('Error fetching users');
      return;
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
  });
