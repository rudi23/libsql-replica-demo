const express = require('express');
const { createClient } = require('@libsql/client');
const app = express();
const port = 3800;

const serverClient = createClient({
  url: 'http://localhost:8080',
  authToken: 'dXNlcjpwYXNzd29yZA=='
});

const replicaClient = createClient({
  url: 'http://localhost:8081',
  authToken: 'dXNlcjpwYXNzd29yZA=='
});

const replica2Client = createClient({
  url: 'http://localhost:8082',
  authToken: 'dXNlcjpwYXNzd29yZA=='
});

app.get('/', async (req, res) => {
  res.send('To interact with the databases use:<br> /server<br> /server/add<br> /replica<br> /replica/add<br> /replica2<br> /replica2/add<br>');
});

app.get('/server', async (req, res) => {
  try {
    const result = await serverClient.execute('SELECT * FROM books');
    
    res.json({ length: result.rows.length, rows: result.rows });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Error connecting to database');
  }
});

app.get('/server/add', async (req, res) => {
  try {
    await serverClient.execute('INSERT INTO books (title, author) VALUES ("Added from server", "Server author")');

    res.send('Added from server');
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Error connecting to database');
  }
});

app.get('/replica', async (req, res) => {
  try {
    const result = await replicaClient.execute('SELECT * FROM books');

    res.json({ length: result.rows.length, rows: result.rows });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Error connecting to database');
  }
});

app.get('/replica/add', async (req, res) => {
  try {
    await replicaClient.execute('INSERT INTO books (title, author) VALUES ("Added from replica", "Replica author")');

    res.send('Added from replica');
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Error connecting to database');
  }
});

app.get('/replica2', async (req, res) => {
  try {
    const result = await replica2Client.execute('SELECT * FROM books');

    res.json({ length: result.rows.length, rows: result.rows });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Error connecting to database');
  }
});

app.get('/replica2/add', async (req, res) => {
  try {
    await replica2Client.execute('INSERT INTO books (title, author) VALUES ("Added from replica2", "Replica2 author")');

    res.send('Added from replica2');
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Error connecting to database');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 