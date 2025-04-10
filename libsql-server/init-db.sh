#!/bin/bash
set -e

echo "====================================="
echo "LibSQL Server Database Initialization"
echo "====================================="

# Function to execute SQL with error handling
execute_sql() {
  local sql=$1
  local description=$2
  
  echo -e "\n🔄 $description..."
  
  # Execute SQL and store the response
  local response
  response=$(curl -s -X POST http://localhost:8080/v1/execute \
    -H "Content-Type: application/json" \
    -H "Authorization: Basic dXNlcjpwYXNzd29yZA==" \
    -d "{\"stmt\": [\"$sql\"]}")
    
  # Check if the response contains an error
  if echo "$response" | grep -q "error"; then
    echo "❌ Error executing SQL: $sql"
    echo "Response: $response"
    return 1
  else
    echo "✅ Success!"
    echo "Response: $response"
    return 0
  fi
}

# Wait for the server to start
echo -e "\n⏳ Waiting for LibSQL server to start..."
sleep 5

# Test the connection with a version check
echo -e "\n🔍 Testing connection to LibSQL server..."
execute_sql "SELECT sqlite_version()" "Checking SQLite version" || exit 1

# Create the books table
execute_sql "CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, author TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)" "Creating books table" || exit 1

# Insert sample data
execute_sql "INSERT INTO books (title, author) VALUES ('The Great Gatsby', 'F. Scott Fitzgerald')" "Adding book: The Great Gatsby" || exit 1
execute_sql "INSERT INTO books (title, author) VALUES ('To Kill a Mockingbird', 'Harper Lee')" "Adding book: To Kill a Mockingbird" || exit 1
execute_sql "INSERT INTO books (title, author) VALUES ('1984', 'George Orwell')" "Adding book: 1984" || exit 1
execute_sql "INSERT INTO books (title, author) VALUES ('Pride and Prejudice', 'Jane Austen')" "Adding book: Pride and Prejudice" || exit 1
execute_sql "INSERT INTO books (title, author) VALUES ('The Catcher in the Rye', 'J.D. Salinger')" "Adding book: The Catcher in the Rye" || exit 1

# Verify the data
execute_sql "SELECT COUNT(*) FROM books" "Counting books" || exit 1
execute_sql "SELECT * FROM books" "Listing all books" || exit 1

echo -e "\n🎉 Database initialized successfully!" 