const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const Schema = mongoose.Schema
require('express-async-errors')

const CustomerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        validate: {
            validator: validator.isEmail,
            message: 'Please provide valid email'
        },
        trim: true
    },
    password: {
        type: String,
        trim: true
    },
    contactNumber: {
        type: Number,
        required: true
    },
    district: {
        type: String,
        trim: true,
        required: true
    },
    state: {
        type: String,
        trim: true,
        required: true
    },
    password: {
        type: String,
        trim: true
    },
    otpForVerification: {
        type: String,
        default: null
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })


CustomerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

CustomerSchema.methods.createJWT = function () {
    return jwt.sign({
        customerId: this._id,
        email: this.email
    },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_LIFETIME
        })
}

CustomerSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}

module.exports = mongoose.model('Customer', CustomerSchema)