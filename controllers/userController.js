const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

// @desc register a user
// @route Get /api/users/register
// @access public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }
  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("User already registered with the email");
  }

  //Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("hashed password", hashedPassword);
  const user = User.create({
    username,
    email,
    password: hashedPassword,
  });
  console.log(`User created successfully ${user}`);
  if(user) {
    res.status(201).json({_id: user.id, email: user.email});
  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }
  res.send(user);
});

// @desc login a user
// @route Get /api/users/login
// @access public
const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory");
    }
    const user = await User.findOne({email});
    //compare password with hashed password
    if(user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign({
            user: {
                username: user.username,
                email: user.email,
                id: user.id
            }
        }, process.env.ACCESS_TOKEN_SECRET,
    {expiresIn: "15m"});
        res.status(200).json({accessToken});
    } else {
        res.status(401);
        throw new Error("Invalid credentials");
    }
});

// @desc get current user info
// @route Get /api/users/current
// @access private
const currentUser = asyncHandler(async (req, res) => {
  res.send(req.user);
});

module.exports = { registerUser, loginUser, currentUser };
