// esg-system/dbConfig.js

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'esg_system',
  password: '1234',
  port: 5432, 
});

module.exports = { pool };
