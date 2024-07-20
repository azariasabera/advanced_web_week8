var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');

// =================== mongoDB setup ===================
const mongoose = require('mongoose');
const Users = require("../models/Users");

const mongoDB = 'mongodb://127.0.0.1:27017/testdb';
mongoose.connect(mongoDB)
        .then(() => console.log("MongoDB is connected!"))
        .catch((error) => console.log(`Error has occured: ${error}`));

mongoose.Promise = Promise;
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error!!!"));
// =====================================================

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/api/user/register', (req, res)=>{
  // See the teacher's code for .findOne() method in week7 repo.
    Users.findOne({email: req.body.email})
        .then(async (user) => {
            if(!user){
              const hashedPassword = await bcrypt.hash(req.body.password, 10)
                let newUser = new Users({
                    email: req.body.email,
                    password: hashedPassword
                });
                newUser.save();
                res.send('User registered');
            } else {
                res.status(403).send('email already exists');
            }
        }).catch((error) => {
            res.status(500).send(`Error occured: ${error}`);
        });
});


module.exports = router;
