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
    contactNumber: {
        type: Number,
        required: true
    },
    agriculturalPropertiesForWhichRequestSentToPropertyDealer: [
        {
            propertyId: String,
            date: Date,
            _id: {
                type: Schema.Types.ObjectId,
                default: undefined,
            }
        }
    ],
    commercialPropertiesForWhichRequestSentToPropertyDealer: [
        {
            propertyId: String,
            date: Date,
            _id: {
                type: Schema.Types.ObjectId,
                default: undefined,
            }
        }
    ],
    residentailPropertiesForWhichRequestSentToPropertyDealer: [
        {
            propertyId: String,
            date: Date,
            _id: {
                type: Schema.Types.ObjectId,
                default: undefined,
            }
        }
    ]
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