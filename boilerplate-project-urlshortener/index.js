require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;
const dbUrl = process.env.MONGO_URI;
const URL_PATTERN =
  /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g;

// connect to MongoDB
mongoose.connect(
  dbUrl,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) console.log(err);
    else console.log("mongdb is connected");
  }
);

let counterSchema = new mongoose.Schema({
  db: String,
  coll: String,
  seq_value: Number,
});

let urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: Number,
});

let CounterModel = mongoose.model("Counter", counterSchema, "counters");
let URLModel = mongoose.model("URL", urlSchema, "urls");

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(express.json()); /** Decode JSON data */
app.use(express.urlencoded()); /** Decode Form URL Encoded data */

// app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

const findOne = (params, done) => {
  URLModel.findOne(params, (err, data) => {
    if (err) return console.error(err);
    done(null, data);
  });
};

const createNewCounter = (done) => {
  CounterModel.findOneAndUpdate(
    { db: "test2", coll: "urls" },
    { $inc: { seq_value: 1 } }, // increase old data plus 1
    { new: true, returnNewDocument: true, upsert: true },
    (err, data) => {
      if (err) return console.error(err);
      done(null, data.seq_value);
    }
  );
};

const createNewUrl = (originalUrl, shortUrl, done) => {
  const doc = URLModel({
    originalUrl,
    shortUrl,
  });

  doc.save((err, data) => {
    if (err) return console.error(err);
    done(null, data);
  });
};

app.post("/api/shorturl", (req, res, next) => {
  const url = req.body.url;
  const urlObj = new URL(url);
  dns.lookup(urlObj.hostname, (err) => {
    if (err) {
      console.log("err :>> ", err);
      res.json({
        error: "invalid url",
      });
      return next();
    }

    findOne({ originalUrl: url }, (err, data) => {
      if (err) {
        return next(err);
      }

      if (!data) {
        createNewCounter((err, seq_value) => {
          if (err) {
            return next(err);
          }

          createNewUrl(url, seq_value, (err, data) => {
            if (err) {
              return next(err);
            }

            console.log("create new url success");
            res.json({
              original_url: url,
              short_url: data.shortUrl,
            });
            return;
          });
        });
      } else {
        console.log("exist", data);
        res.json({
          original_url: url,
          short_url: data.shortUrl,
        });
        return;
      }
    });
  });
});

app.get("/api/shorturl/:shortUrl", (req, res) => {
  const shortUrl = req.params.shortUrl;

  if (shortUrl && !isNaN(shortUrl)) {
    findOne({ shortUrl: +shortUrl }, (err, data) => {
      if (err) {
        return next(err);
      }
      if (data) {
        res.redirect(data.originalUrl);
        console.log("redirect success :>> ");
      } else {
        res.json({
          error: "No short URL found for the given input",
        });
      }
    });
  } else {
    res.json({
      error: "No short URL found for the given input",
    });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});