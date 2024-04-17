const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
require('express-async-errors')

const RequestToAddPropertySchema = new mongoose.Schema({
    dealerId: {
        type: String,
        trim: true,
    },
    propertyType: {
        type: String,
        enum: ['agricultural', 'residential', 'commercial'],
        trim: true,
    },
    location: {
        plotNumber: {
            type: String,
            trim: true
        },
        village: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        tehsil: {
            type: String,
            trim: true
        },
        district: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
            trim: true
        }
    },
    requestDate: {
        type: Date
    }
});

const FieldAgentSchema = new mongoose.Schema({
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
        required: [true, 'Please provide password']
    },
    /*authTokenExpiration: {
        type: Date,
        default: null
    },*/
    passwordVerificationToken: {
        type: String,
        default: null
    },
    passwordVerificationTokenExpirationDate: {
        type: Date,
        default: null
    },
    district: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    otpForVerification: {
        type: String,
        default: null
    },
    requestsToAddProperty: [RequestToAddPropertySchema]
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })


FieldAgentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

FieldAgentSchema.methods.createJWT = function () {
    return jwt.sign({
        fieldAgentId: this._id, email: this.email
    },
        process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME
    })
}

FieldAgentSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}

module.exports = mongoose.model('FieldAgent', FieldAgentSchema)