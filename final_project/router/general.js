const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username e password sono richiesti"});
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({message: "Username già esistente"});
  }

  users.push({"username": username, "password": password});
  return res.status(201).json({message: "Utente registrato con successo"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({message: "Libro non trovato"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const keys = Object.keys(books);
  const filteredBooks = [];

  keys.forEach((key) => {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      filteredBooks.push({ isbn: key, ...books[key] });
    }
  });

  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({message: "Nessun libro trovato per questo autore"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const keys = Object.keys(books);
  const filteredBooks = [];

  keys.forEach((key) => {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      filteredBooks.push({ isbn: key, ...books[key] });
    }
  });

  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({message: "Nessun libro trovato con questo titolo"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({message: "Libro non trovato"});
  }
});

module.exports.general = public_users;
