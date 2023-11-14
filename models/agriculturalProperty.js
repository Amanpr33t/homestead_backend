
const jwt = require('jsonwebtoken')
require('dotenv').config()
const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');

const LandSizeSchema = new mongoose.Schema({
    size: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true,
        trim: true
    },
    details: {
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
    details: {
        type: String,
        trim: true
    },
})
const PropertyLocationSchema = new mongoose.Schema({
    name: {
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
            required: true
        },
        state: {
            type: String,
            trim: true,
            required: true
        }
    }
})
const WaterSourceSchema = new mongoose.Schema({
    canal: {
        type: Array
    },
    river: {
        type: Array
    },
    tubewells: {
        numberOfTubewells: {
            type: Number
        },
        depth: {
            type: Array
        }
    }
})
const ReservoirSchema = new mongoose.Schema({
    isReservoir: {
        type: Boolean,
        required: true
    },
    type: {
        type: String
    },
    capacityOfPrivateReservoir: {
        type: Number
    },
    unitOfCapacityForPrivateReservoir: {
        type: String
    }
})

const AgriculturalPropertySchema = new mongoose.Schema({
    landsize: LandSizeSchema,
    location:PropertyLocationSchema,
    roadConnectivity: RoadConnectivitySchema,
    agriculturalLandImagesUrl: {
        type: Array,
        default: []
    },
    contractImagesUrl: {
        type: Array,
        default: []
    },
    numberOfOwners: {
        type: Number,
        require: true
    },
    waterSource: WaterSourceSchema,
    reservoir: ReservoirSchema,
    irrigationSystem: {
        type: Array,
        default: []
    },
    priceDemanded: {
        number: {
            type: Number,
            reuired: true
        },
        words: {
            type: String,
            reuired: true,
            trim: true
        }
    },
    crops: {
        type: Array,
        default: []
    },
    road: {
        type: {
            type: String,
            reuired: true,
            trim: true
        },
        details: {
            type: String,
            trim: true
        }
    },
    legalRestrictions: LegalRestrictionsSchema,
    nearbyTown:{
        type:String,
        trim:true
    },
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