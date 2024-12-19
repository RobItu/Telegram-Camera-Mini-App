// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  user: 'postgres',
  host: '192.168.1.139',
  database: 'my_database',
  password: '1',
  port: 5432,
});

app.post('/api/saveData', async (req, res) => {
  const { username, image64URL, locationTags, timestamp } = req.body;
  try {
    const query = `
      INSERT INTO user_data (username, image_url, location_tags, timestamp)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const values = [username, image64URL, locationTags, timestamp];
    const result = await pool.query(query, values);
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error saving data' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
