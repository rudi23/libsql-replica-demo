const express = require("express");
const { createClient } = require("@libsql/client");
const app = express();
const port = 3800;
const fs = require("fs");

if (!fs.existsSync("./.db")) {
	fs.mkdirSync("./.db");
}

const serverClient = createClient({
	url: "http://localhost:8080",
	authToken: "dXNlcjpwYXNzd29yZA==",
});

const replicaClient = createClient({
	url: "file:./.db/books.db",
	syncUrl: "http://localhost:8080",
	authToken: "dXNlcjpwYXNzd29yZA==",
});

const replica2Client = createClient({
	url: "file:./.db/books2.db",
	syncUrl: "http://localhost:8080",
	authToken: "dXNlcjpwYXNzd29yZA==",
});

app.get("/", async (req, res) => {
	res.send(
		"To interact with the databases use:<br> /server<br> /server/add<br> /replica<br> /replica/add<br> /replica2<br> /replica2/add<br>"
	);
});

app.get("/server", async (req, res) => {
	try {
		await serverClient.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL
      )
    `);
		const result = await serverClient.execute("SELECT * FROM books");

		res.json({ length: result.rows.length, rows: result.rows });
	} catch (error) {
		console.error("Database error:", error);
		res.status(500).send("Error connecting to database");
	}
});

app.get("/server/add", async (req, res) => {
	try {
		await serverClient.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL
      )
    `);
		await serverClient.execute('INSERT INTO books (title, author) VALUES ("Added from server", "Server author")');

		res.send("Added from server");
	} catch (error) {
		console.error("Database error:", error);
		res.status(500).send("Error connecting to database");
	}
});

app.get("/replica", async (req, res) => {
	try {
		await replicaClient.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL
      )
    `);
		const result = await replicaClient.execute("SELECT * FROM books");

		res.json({ length: result.rows.length, rows: result.rows });
	} catch (error) {
		console.error("Database error:", error);
		res.status(500).send("Error connecting to database");
	}
});

app.get("/replica/add", async (req, res) => {
	try {
		await replicaClient.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL
      )
    `);
		await replicaClient.execute('INSERT INTO books (title, author) VALUES ("Added from replica", "Replica author")');

		res.send("Added from replica");
	} catch (error) {
		console.error("Database error:", error);
		res.status(500).send("Error connecting to database");
	}
});

app.get("/replica2", async (req, res) => {
	try {
		await replica2Client.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL
      )
    `);
		const result = await replica2Client.execute("SELECT * FROM books");

		res.json({ length: result.rows.length, rows: result.rows });
	} catch (error) {
		console.error("Database error:", error);
		res.status(500).send("Error connecting to database");
	}
});

app.get("/replica2/add", async (req, res) => {
	try {
		await replica2Client.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL
      )
    `);
		await replica2Client.execute('INSERT INTO books (title, author) VALUES ("Added from replica2", "Replica2 author")');

		res.send("Added from replica2");
	} catch (error) {
		console.error("Database error:", error);
		res.status(500).send("Error connecting to database");
	}
});

// Start the server
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
