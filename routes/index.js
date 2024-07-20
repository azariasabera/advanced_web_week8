var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const {body, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
require('dotenv').config();

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

router.post('/api/user/register', 
  body('email').isEmail(),
  body('password').isLength({min: 3}),

  (req, res, next)=>{  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
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

router.post('/api/user/login', 
  body('email').isEmail(),
  body('password').isLength({min: 3}), 

  async (req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    Users.findOne({email: req.body.email})
        .then(async (user) => {
            console.log('I am here');
            if(user){
                if(await bcrypt.compare(req.body.password, user.password)){
                    const tokenPayload = {
                        email: user.email
                    }
                    console.log('I am here 2');
                    jwt.sign(
                      tokenPayload, 
                      process.env.ACCESS_TOKEN_SECRET,
                      {expiresIn: '1h'},
                      (error, token) => {
                          if(error){
                              res.status(403).send(`Error in signing: ${error}`);
                          } else {
                              res.json({
                                success: true,
                                token: token});
                          }
                      })}
                else{
                    res.status(403).send('Login failed, password incorrect');
                }
            }
            else{
                res.status(403).send('Login failed, user not found');
            }
        }
    ).catch((error) => {
        res.status(500).send(`Error in .findOne: ${error}`);
    });
});

module.exports = router;
