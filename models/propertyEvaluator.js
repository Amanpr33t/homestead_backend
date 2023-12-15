const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema
const jwt = require('jsonwebtoken')
require('express-async-errors')

const PropertyEvaluatorSchema = new mongoose.Schema({
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
    passwordVerificationToken: {
        type: String,
        default: null
    },
    passwordVerificationTokenExpirationDate: {
        type: Date,
        default: null
    },
    propertiesSuccessfullyEvaluated: {
        type: Array,
        default: []
    },
    propertiesSentToFieldAgentForReconsideration: {
        type: Array,
        default: []
    },
    pendingPropertyEvaluations: [
        {
            propertyId: String,
            propertyType: String,
            district: String,
            state: String,
            date: Date,
            _id: {
                type: Schema.Types.ObjectId,
                default: undefined,
            }
        }
    ],
    isActive: {
        type: Boolean,
        default: true
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
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })


PropertyEvaluatorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

PropertyEvaluatorSchema.methods.createJWT = function () {
    return jwt.sign({
        propertyEvaluatorId: this._id, email: this.email
    },
        process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME
    })
}

PropertyEvaluatorSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}

module.exports = mongoose.model('PropertyEvaluator', PropertyEvaluatorSchema)