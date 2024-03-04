const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const Schema = mongoose.Schema
require('express-async-errors')

const AddressSchema = new mongoose.Schema({
    flatPlotHouseNumber: {
        type: String,
        trim: true,
        required: [true, 'Provide flat/plot/house number']
    },
    areaSectorVillage: {
        type: String,
        trim: true,
        required: [true, 'Provide area/sector/village']
    },
    landmark: {
        type: String,
        trim: true
    },
    postalCode: {
        type: Number,
        required: [true, 'Provide postal code']
    },
    city: {
        type: String,
        trim: true,
        required: [true, 'Provide city']
    },
    state: {
        type: String,
        trim: true,
        required: [true, 'Provide state']
    },
    district: {
        type: String,
        trim: true,
        required: [true, 'Provide district']
    },
    _id: {
        type: Schema.Types.ObjectId,
        default: undefined,
    }
})

const CustomerRequestSchema = new mongoose.Schema({
    propertyId: {
        type: String,
        required: true,
        trim: true
    },
    customerId: {
        type: String,
        required: true,
        trim: true
    },
    customerName: {
        type: String,
        trim: true
    },
    requestSeen: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        required: true
    },
    _id: {
        type: Schema.Types.ObjectId,
        default: undefined,
    }
})

const PropertyDealerSchema = new mongoose.Schema({
    firmName: {
        type: String,
        required: [true, 'Please provide a firm name'],
        trim: true
    },
    propertyDealerName: {
        type: String,
        required: [true, 'Please provide property dealers name'],
        trim: true
    },
    firmLogoUrl: {
        type: String,
        trim: true
    },
    about: {
        type: String,
        trim: true
    },
    experience: {
        type: Number,
        required: [true, 'Please add experience']
    },
    address: AddressSchema,
    gstNumber: {
        type: String,
        required: [true, 'Please add gst number'],
        trim: true
    },
    reraNumber: {
        type: String,
        required: [true, 'Please add rera number'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        trim: true
    },
    contactNumber: {
        type: Number,
        required: [true, 'Please provide a contact number'],
    },
    password: {
        type: String,
        trim: true
    },
    addedByFieldAgent: {
        type: mongoose.Types.ObjectId,
        ref: 'FieldAgent'
    },
    otpForVerification: {
        type: String,
        default: null
    },
    otpForVerificationExpirationDate: {
        type: Date,
        default: null
    },
    uniqueId: {
        type: String,
        trim: true,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    authTokenExpiration: {
        type: Date,
        default: null
    },
    passwordVerificationToken: {
        type: String,
        trim: true,
        default: null
    },
    passwordVerificationTokenExpirationDate: {
        type: Date,
        trim: true,
        default: null
    },
    requestsFromCustomer: [CustomerRequestSchema],
    reviewsFromCustomer: [
        {
            review: {
                type: String,
                trim: true
            },
            rating: {
                type: Number
            },
            customerName: {
                type: String,
                trim: true
            },
            customerId: {
                type: mongoose.Types.ObjectId,
                ref: 'Customer',
            },
            date: {
                type: Date
            }
        },
    ]
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

PropertyDealerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

PropertyDealerSchema.methods.createJWT = function () {
    return jwt.sign({
        dealerId: this._id, email: this.email
    },
        process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME
    })
}

PropertyDealerSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}


module.exports = mongoose.model('PropertyDealer', PropertyDealerSchema)