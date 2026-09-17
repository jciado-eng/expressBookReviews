const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  if (!username) return false;
  const userExists = users.some((user) => user.username === username);
  return !userExists;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const matchingUser = users.find((user) => user.username === username && user.password === password);
  return !!matchingUser;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(401).json({message: "Invalid credentials"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({message: "User not authenticated"});
  }

  if (!review) {
    return res.status(400).json({message: "Review text is required"});
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }

  book.reviews[username] = review;
  return res.status(200).json({message: "Review successfully added or modified"});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({message: "User not authenticated"});
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }

  if (book.reviews && book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({message: "Your review has been successfully deleted"});
  } else {
    return res.status(404).json({message: "No review found for this user on this book"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
