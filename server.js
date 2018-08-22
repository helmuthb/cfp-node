var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var path = require('path');

var app = express();
var upload = multer(); // for parsing multipart/form-data

// request body: in Json
app.use(bodyParser.json());

// static files
app.use(express.static(path.join(__dirname, 'static')));

app.listen(8000);
console.log('Listening on port 8000');
