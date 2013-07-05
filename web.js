var express = require('express');
var fs = require('fs');
var infile = 'index.html';
var data = fs.readFileSync(infile, 'utf8');
console.log('test_data'+ data.toString());

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
   response.send("temp");
   response.send(data.toString());
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
