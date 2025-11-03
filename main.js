//Require
const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");

//ENV
require("dotenv").config({ path: "config/config.env" });

//Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

module.exports = app;