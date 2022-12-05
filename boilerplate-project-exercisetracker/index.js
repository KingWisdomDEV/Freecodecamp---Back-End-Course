const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded())

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Basic Configuration
const port = process.env.PORT || 3000;
const dbUrl = process.env.MONGO_URI;

// connect to MongoDB
mongoose.connect(
  dbUrl,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) console.log(err);
    else console.log("mongdb is connected");
  }
)

const exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date,
})

const userSchema = new mongoose.Schema({
  username: String,
})

const logSchema = new mongoose.Schema({
  username: String,
  count: Number,
  log: [{
    description: String,
    duration: Number,
    date: Date,
  }]
})

const ExerciseModel = mongoose.model("Exercise", exerciseSchema, "exercises")
const UserModel = mongoose.model("User", userSchema, "users")
const LogModel = mongoose.model("Log", logSchema, "logs")


const createNewUser = (username, done) => {
  const userDoc = UserModel({username});

  userDoc.save((err, data) => {
    if (err) return console.error(err);
    done(null, data);
  });
};

const getUsers = (done) => {
  UserModel.find({}, (err, data) => {
    if (err) return console.error(err);
    done(null, data);
  })
}

const getUserById = (userId, done) => {
  UserModel.findById(userId, (err, data) => {
    if (err) return console.error(err);
    done(null, data);
  })
}

const createNewDoc = (document, done) => {
  document.save((err, data) => {
    if (err) return console.error(err);
    done(null, data);
  });
};

const getExercisesByUserName = (username, from, to, limit, done) => {
  ExerciseModel.find({username}, (err, data) => {
    if (err) return console.error(err);
    done(null, data);
  })
}

app.route("/api/users")
  .get((req, res) => {
    getUsers((err, users) => {
      if(err){
        res.send({
          error: "Something bad happens"
        })
        return
      }
      res.json(users);
      console.log("get all user success")
    })
  })
  .post((req, res) => {
    const username = req.body.username
    if(!username) {
      res.json({
        error: "Invalid username!"
      })
      return 
    }
  
    createNewUser(username, (err, newUser) => {
      if(err){
        res.json({
          error: "Invalid username!"
        })
        return
      }
      res.json(newUser);
      console.log("create new user success")
    })
  })

app.post("/api/users/:id/exercises", (req, res) => {
  const id = req.params.id
  const description = req.body.description
  const duration = +(req.body.duration)
  const date = req.body.date ? new Date(req.body.date) : new Date()

  if(!id || !description || !duration){
    res.json({
      error: "Invalid data!"
    })
    return 
  }

  getUserById(id, (err, user) => {
    // console.log("id", id)
    // console.log("description", description)
    // console.log("duration", duration)
    // console.log("date", date, date.toDateString())
    if(err){
      res.json({
        error: "Invalid user id!"
      })
      return
    }
    
    const exerciseDoc = ExerciseModel({
      username: user.username,
      description,
      duration,
      date: date
    });
    createNewDoc(exerciseDoc, (err, newExercise) => {
      if(err){
        res.json({
          error: "Something bad happens"
        })
        return
      }

      res.json({
        _id: id, 
        username: newExercise.username,
        description: newExercise.description,
        duration: newExercise.duration,
        date: newExercise.date.toDateString()
      })
      console.log("Create new exercise success")
    })
  })
})

app.get("/api/users/:id/logs", (req, res) => {
  const id = req.params.id
  const from = req.query.from
  const to = req.query.to
  const limit = +req.query.limit

  if(!id){
    res.json({
      error: "Invalid data!"
    })
    return 
  }

  getUserById(id, async (err, user) => {
    if(err){
      res.json({
        error: "Invalid user id!"
      })
      return
    }
    try {
      let query = {
        username: user.username
      }
    
      if(from) 
        query.date = {...query.date, "$gte": new Date(from)}
      if(to) 
        query.date = {...query.date, "$lte": new Date(to)}
      
      const [countExercise, exercises] = await Promise.all([
        ExerciseModel.countDocuments({username: user.username}).exec(),
        ExerciseModel.find(query).limit(limit).exec()
      ])
      // const countExercise = await ExerciseModel.countDocuments({username: user.username}).exec();
      // const exercises = await ExerciseModel.find({username: user.username, date: {"lte": }}).limit(limit).exec();
      
      console.log("temp", countExercise, exercises)
      const userLogs = exercises.map((exer) => ({
        description: exer.description,
        duration: exer.duration,
        date: exer.date.toDateString()
      }))
    
      res.json({
        username: user.username,
        count: countExercise,
        _id: user._id, 
        log: userLogs
      })
      console.log("Get all log success")
    } catch (error) {
      console.log(error)
      res.json({
        error: "Something bad happens"
      })
      return
    }
  })
})

const listener = app.listen(port, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
