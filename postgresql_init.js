const { Pool, Client } = require('pg')
const client = new Client({
  user: 'postgres',
  host: 'localhost', // if running locally use localhost
  database: 'postgres',
  password: 'password',
  port: 5432,
})

// if running locally use localhost, if separate images use 172.17.0.2 if in compose use db and with kubernetes use localhost
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'password',
  port: 5432,
})

function PSQLinitialization() {
  client
    .connect()
    .then(() => console.log('connected'))
    .catch(err => {
      console.error('connection error', err.stack)
      process.exit(1)
    });
  const tablename = 'users';
  const createTable = `CREATE TABLE IF NOT EXISTS users(name VARCHAR(80), title VARCHAR(80))`;
  pool.query(createTable, (err, res) => {
    console.log(err, res);
  });
}

module.exports = {
  PSQLinitialization,
  client,
  pool
}
