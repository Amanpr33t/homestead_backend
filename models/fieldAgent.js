const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const jwt= require('jsonwebtoken')
require('express-async-errors')

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
    authTokenExpiration: {
        type: Date,
        default: null
    },
    propertiesAdded: {
        agricultural:{
            type:Array,
            default:[]
        },
        commercial:{
            type:Array,
            default:[]
        },
        residential:{
            type:Array,
            default:[]
        }
    },
    propertyDealersAdded: {
        type: Array,
        default: []
    },
    passwordVerificationToken: {
        type: String,
        default: null
    },
    passwordVerificationTokenExpirationDate: {
        type: Date,
        default: null
    }
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