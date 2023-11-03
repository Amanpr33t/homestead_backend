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
    image: {
        type: String,
        // default:'/uploads/zlatan.jpg'
    },
    about: {
        type: String,
        required: [true, 'Please provide an about'],
        trim: true
    },
    experience: {
        type: Number,
        required: [true, 'Please add experience']
    },
    languages: {
        type: Array,
        default: []
    },
    propertyType: {
        type: Array,
        default: []
    },
    areaOfOperation: {
        type: String,
        required: [true, 'Please add area of operation']
    },
    officeAddress: {
        type: String,
        required: [true, 'Please add office address']
    },
    gstNumber: {
        type: String,
        required: [true, 'Please add gst number']
    },
    addedByFieldAgent: {
        type: mongoose.Types.ObjectId,
        ref: 'FieldAgent',
        required: [true, 'Please provide a field agent id']
    },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })


module.exports = mongoose.model('PropertyDealer', PropertyDealerSchema)