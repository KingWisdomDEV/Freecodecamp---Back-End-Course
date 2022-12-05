// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api", function (req, res) {
  const currentTime = new Date()
  res.json({unix: currentTime.getTime(), utc: currentTime.toUTCString()});
});

// your first API endpoint... 
app.get("/api/:year-:month-:day", function (req, res) {
  const currentTime = new Date(
    req.params.year,
    req.params.month - 1, 
    req.params.day 
  )
  if(!isNaN(currentTime.getTime()))
    res.json({unix: currentTime.getTime(), utc: currentTime.toUTCString()});
  else 
    res.json({error: "Invalid Date" });
});

// your first API endpoint... 
app.get("/api/:dateString", function (req, res) {
  var dateString = req.params.dateString;
  const currentTime = new Date(isNaN(dateString) ? dateString : +dateString)
  if(!isNaN(currentTime.getTime()))
    res.json({unix: currentTime.getTime(), utc:         currentTime.toUTCString()}); 
  else 
    res.json({error: "Invalid Date" });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

