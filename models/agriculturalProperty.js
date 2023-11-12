
const jwt = require('jsonwebtoken')
require('dotenv').config()
const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');

const LandSizeSchema = new mongoose.Schema({
    metreSquare: {
        type: Number,
    },
    acre: {
        type: Number,
    },
    remarks: {
        type: String,
        trim: true
    },
})
const RoadConnectivitySchema = new mongoose.Schema({
    roadType: {
        type: String,
        required: true,
        trim: true
    },
    remarks: {
        type: String,
        trim: true
    },
})
const LegalRestrictionsSchema = new mongoose.Schema({
    isLegalRestrictions: {
        type: Boolean,
        required: true
    },
    remarks: {
        type: String,
        trim: true
    },
})
const PropertyLocationSchema = new mongoose.Schema({
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
        trim: true
    },
    state: {
        type: String,
        trim: true
    }
})

const AgriculturalPropertySchema = new mongoose.Schema({
    landsize: LandSizeSchema,
    roadConnectivity: RoadConnectivitySchema,
    waterSource: {
        type: Array,
        default: []
    },
    irrigationSystem: {
        type: Array,
        default: []
    },
    suitableCrops: {
        type: Array,
        default: []
    },
    privateReservoir: {
        type: Boolean,
        required: true
    },
    legalRestrictions: LegalRestrictionsSchema,
    electricityConnections: {
        type: Number,
        default: 0
    },
    numberOfOwners: {
        type: Number,
        default: 1
    },
    numberOfTubewells: {
        type: Number,
        default: 0
    },
    propertyImage: {
        type: [Array],
        default: []
    },
    propertyLocation: PropertyLocationSchema,
    addedByFieldAgent: {
        type: mongoose.Types.ObjectId,
        ref: 'FieldAgent',
        required: [true, 'Please provide a field agent id']
    },
    addedByPropertyDealer: {
        type: mongoose.Types.ObjectId,
        ref: 'PropertyDealer',
        required: [true, 'Please provide a property dealer id']
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })


module.exports = mongoose.model('AgriculturalProperty', AgriculturalPropertySchema)