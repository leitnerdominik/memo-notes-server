const express = require("express");
const mongoose = require("mongoose");

const app = express();


const { DB_USER, DB_PASSWORD, DB_NAME } = process.env;
const dbUrl = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0-d0m2c.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;
mongoose
  .connect(dbUrl)
  .then((result) => {
    app.listen(5000);
  })
  .catch((err) => console.log(err));
