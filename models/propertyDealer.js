const jwt = require('jsonwebtoken')
require('dotenv').config()
const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');

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
    //cloudinaryImageURL: {
    firmLogoUrl: {
        type: String,
        required: [true, 'Please provide an image of firm logo'],
    },
    about: {
        type: String,
        trim: true
    },
    experience: {
        type: Number,
        required: [true, 'Please add experience']
    },
    propertyType: {
        type: Array,
        default: []
    },
    addressArray: {
        type: Array,
        default: []
    },
    gstNumber: {
        type: String,
        required: [true, 'Please add gst number']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        trim: true
    },
    contactNumber: {
        type: String,
        required: [true, 'Please provide a contact number'],
        trim: true
    },
    addedByFieldAgent: {
        type: mongoose.Types.ObjectId,
        ref: 'FieldAgent',
        required: [true, 'Please provide a field agent id']
    },
    otpForVerification: {
        type: String,
        default: null
    },
    otpForVerificationExpirationDate: {
        type: Date,
        default: null
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })


module.exports = mongoose.model('PropertyDealer', PropertyDealerSchema)