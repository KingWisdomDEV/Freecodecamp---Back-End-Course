let express = require('express');
let app = express();
let bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }))

app.get("/", (req, res) => {
  // serve the String
  // res.send('Response String')

  // serve the HTML file
  path = __dirname + "/views/index.html";
  res.sendFile(path);
  
} );

// Implement a Root-Level Request Logger Middleware
app.use((req, res, next) => {
  console.log(req.method, req.path,"-", req.ip);
  bodyParser.urlencoded({extended: false})
  next();
});

// serve static assets
app.use("/public",express.static(__dirname +"/public"));

// serve json
app.get("/json", (req,res) => {
  const message = "Hello json";
  res.json({"message": process.env.MESSAGE_STYLE === "uppercase" ? message.toUpperCase() : message })
})

// Chain Middleware to Create a Time Server
app.get('/now', function(req, res, next) {
  req.time = new Date().toString();  // Hypothetical synchronous operation
  next();
}, function(req, res) {
  res.send({
      time: req.time
    });
});

// Get Route Parameter Input from the Client
app.get("/:word/echo", (req, res) => {
  res.json({echo: req.params.word})
})

// Get Query Parameter Input from the Client
app.get("/name", (req, res) => {
  res.json(
    {
      name: req.query.first+ ' ' + req.query.last
    }
  )
})

// Get Data from POST Requests
app.post("/name", (req, res) => {
  res.json(
    {
      name: req.body.first+ ' ' + req.body.last
    }
  )
})

// Shorthand
// app.route("/").get(handler).post(handler)





















 module.exports = app;
