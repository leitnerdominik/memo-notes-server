const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const usersRoute = require('./routes/users-routes');

const app = express();

app.use(bodyParser.json());

app.use('/api/users', usersRoute);

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || 'An unknown error occurred!' });
});

const { DB_USER, DB_PASSWORD, DB_NAME } = process.env;
const dbUrl = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0-d0m2c.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;
mongoose
  .connect(dbUrl)
  .then((result) => {
    app.listen(5000);
  })
  .catch((err) => console.log(err));
