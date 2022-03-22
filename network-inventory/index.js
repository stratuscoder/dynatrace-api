// index.js
const path = require('path');
const express = require('express');
const fs = require("fs");

//server port
const _PORT = 3333;

//global logging settings, turn on/off to apply to all locations
gl_logging = true;

//express app
const app = express();

//use public folder for static content
app.use(express.static('public'))

//parse json
app.use(express.json());
//app.use(require('body-parser').json());

//register apis
require('./api/index')(app);

app.use(function(err, req, res, next) {
    // 'SyntaxError: Unexpected token n in JSON at position 0'
    if (gl_logging) console.log(`Invalid JSON, ${err.message}`);
    next(err);
  });


app.get('/', function(req,res){
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

//run server on specified port
app.listen(_PORT, () => {
    console.log(`API Interface Server is running on port ${_PORT}`);
    console.log(`Global logging is set to ${gl_logging}`);
});