const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const {hash} = require("bcrypt");
const mongoose = require("mongoose");

const UserController = {
    // Register a new user
    register: async (req, res) => {
        try {
            User.find({email: req.body.email})
                .exec().then((user) => {
                if (user.length > 1) {
                    return res.status(409).json({message: "Mail Exists"})
                } else {
                    bcrypt.hash(req.body.password, 10, (error, hash) => {
                        if (error) {
                            return res.status(500).json({
                                error: error,
                            })
                        } else {
                            const _id = new mongoose.Types.ObjectId;
                            const {firstname, lastname, username, email, password} = req.body;
                            const newUser = new User({_id, firstname, lastname, username, email, password});
                            // await
                            newUser.save()
                                .then((result) => {
                                    res.status(201).json({
                                        message: "User is created successfully",
                                        data: {
                                            firstname: result.firstname,
                                            lastname: result.lastname,
                                            email: result.email,
                                            // _id: result._id,
                                        },
                                    });
                                }).catch((err) => {
                                console.error(err);
                                res.status(500).json({
                                    error: err,
                                    stack: err.stack,
                                });
                            });
                        }
                    })
                }
            })
            // const {firstname, lastname, username, email, password} = req.body;
            // const newUser = new User({firstname, lastname, username, email, password});
            // await newUser.save();
            // res.status(201).json({message: "User registered successfully"});
        } catch (err) {
            res.status(400).json({error: "Error registering user", details: err.message});
        }
    },

    // Login user and return a token
    login: async (req, res) => {
        try {
            const {email, password} = req.body;
            const user = await User.findOne({email});
            if (!user) return res.status(404).json({error: "User not found"});

            const isMatch = await user.comparePassword(password);
            if (!isMatch) return res.status(401).json({error: "Invalid credentials"});

            const token = jwt.sign({userId: user._id}, process.env.JWT_KEY, {expiresIn: "1h"});
            user.tokens.push({token});
            await user.save();

            res.status(200).json({message: "Login successful", token});
        } catch (err) {
            res.status(500).json({error: "Error logging in", details: err.message});
        }
    },

    income: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({error: 'Token is required'});
            }

            const {monthlyIncome} = req.body;
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            console.log('Decoded Token:', decoded);
            const user = await User.findById(decoded.userId);
            // const user = await User.findById({ _id: decoded.userId });
            if (!user) {
                return res.status(404).json({error: 'User not found'});
            }
            // console.log('Token:', req.body.token || req.headers.authorization);
            user.monthlyIncome = monthlyIncome;
            await user.save();
            res.status(200).json({message: 'Monthly income set successfully'});
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({error: 'Token expired'});
            }
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({error: 'Invalid token'});
            }
            res.status(500).json({error: 'Error setting income', details: err.message});

            // res.status(500).json({error: 'Error setting income', details: err.message});
            // return res.status(401).json({error: 'Invalid or expired token', details: err.message});
        }
    },

    logout: async (req, res) => {
        try {
            // console.log(req.user);
            req.user.tokens = req.user.tokens.filter(
                (token) => token.token !== req.token
            );
            req.session.destroy();
            await req.user.save();
            return res.status(200).json({
                message: "Logout successful",
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                error: err,
                stack: err.stack,
            });
        }
    }
};

module.exports = UserController;