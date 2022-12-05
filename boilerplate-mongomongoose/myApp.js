require('dotenv').config();
const mongoose = require('mongoose')

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI , { useNewUrlParser: true, useUnifiedTopology: true });
  
// - Person Prototype -
// --------------------
// name : string [required]
// age :  number
// favoriteFoods : array of strings (*)
let personSchema = new mongoose.Schema({
  name: {
    type: String,
     required: true
  }, 
  age: Number,
  favoriteFoods: [String]
})

let Person = mongoose.model("Person", personSchema);

const createAndSavePerson = (done) => {
  const document = Person ({
    name: "King Wisdom", age: 22, favoriteFoods:  ["bakery", "pho bo"]
  })

  document.save((err, data) => {
    if (err) return console.error(err);
    done(null, data)
  })
};

const createManyPeople = (arrayOfPeople, done) => {
  Person.create(arrayOfPeople, (err, data) => {
    if (err) return console.error(err);
    done(null, data)            
  })
};

const findPeopleByName = (personName, done) => {
  Person.find({name: personName}, (err, data) => {
    if (err) return console.error(err);
    done(null, data)
  })
};

const findOneByFood = (food, done) => {
  Person.findOne({favoriteFoods: food}, (err, data) => {
    if (err) return console.error(err);
    done(null, data)
  })
};

const findPersonById = (personId, done) => {
  Person.findById({_id: personId}, (err, data) => {
    if (err) return console.error(err);    
    done(null, data)
  })
};

const findEditThenSave = (personId, done) => {
  const foodToAdd = "hamburger";

  // option 2: Person.findByIdAndUpdate()
  Person.findById({_id: personId}, (err, data) => {
    if (err) return console.error(err);

    data.favoriteFoods.push(foodToAdd);
    data.save((errSave, dataSave) => {
      if (errSave) return console.error(errSave);
      done(null, dataSave)
    })
  })
};

const findAndUpdate = (personName, done) => {
  const ageToSet = 20;
  Person.findOneAndUpdate(
    {name: personName}, 
    {age: ageToSet}, 
    { new: true }, 
    (err, data) => {
      if (err) return console.error(err);    
    done(null, data)
    }
  )
};

const removeById = (personId, done) => {
  //option 2: Person.findOneAndRemove({}, () => {})
  Person.findByIdAndRemove(
    personId, 
    (err, data) => {
      if (err) return console.error(err);
      done(null, data)
    }
  );
};

const removeManyPeople = (done) => {
  const nameToRemove = "Mary";
  Person.remove({name: nameToRemove}, (err, data) => {
    if (err) return console.error(err);  
    done(null, data)
  })
};

const queryChain = (done) => {
  const foodToSearch = "burrito";
  Person.find({favoriteFoods: foodToSearch})
    .sort({ name: 1 })
    .limit(2)
    .select({ age: 0})
    .exec((err, data) => {
      if (err) return console.error(err);
      done(null, data)
    })
};

/** **Well Done !!**
/* You completed these challenges, let's go celebrate !
 */

//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------

exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;
