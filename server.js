const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const cors = require('cors');

const mongoose = require('mongoose');
mongoose.connect(
  process.env.MLAB_URI ||
    "mongodb://user1:mongodb1@ds245532.mlab.com:45532/exercisetracker"
);

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"]
  }
});
const UserModel = mongoose.model("user", UserSchema);

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

//post new user
app.post("/api/exercise/new-user", (req, res) => {
  UserModel.create({ username: req.body.username })
    .then(newUser => {
      res.send(newUser);
    })
    .catch(err => {
      res.send(err.errors.username.message);
    });
});

// get all users
app.get("/api/exercise/users", (req, res) => {
  UserModel.find({}, (err, users) => {
    if (err) res.send(err);
    res.send(users);
  });
});


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'});
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || 'Internal Server Error';
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
