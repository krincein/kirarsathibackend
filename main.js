//Require
const express = require("express");
const cors = require("cors");
const app = express();

//ENV
require("dotenv").config({ path: "config/config.env" });

//Middleware
app.use(express.json());
app.use(cors()); 

app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

module.exports = app;