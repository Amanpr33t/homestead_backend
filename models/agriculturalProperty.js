const jwt = require('jsonwebtoken')
require('dotenv').config()
const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema

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
    _id: {
        type: Schema.Types.ObjectId,
        default: undefined,
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
    _id: {
        type: Schema.Types.ObjectId,
        default: undefined,
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
    _id: {
        type: Schema.Types.ObjectId,
        default: undefined,
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
    },
    _id: {
        type: Schema.Types.ObjectId,
        default: undefined,
      }
})
const WaterSourceSchema = new mongoose.Schema({
    canal: {
        type: Array,
        default: []
    },
    river: {
        type: Array,
        default: []
    },
    tubewells: {
        numberOfTubewells: {
            type: Number
        },
        depth: {
            type: Array,
            default: []
        }
    },
    _id: {
        type: Schema.Types.ObjectId,
        default: undefined,
      }
})
const ReservoirSchema = new mongoose.Schema({
    isReservoir: {
        type: Boolean,
        required: true
    },
    type: {
        type: Array
    },
    capacityOfPrivateReservoir: {
        type: Number
    },
    unitOfCapacityForPrivateReservoir: {
        type: String
    },
    _id: {
        type: Schema.Types.ObjectId,
        default: undefined,
      }
})

const AgriculturalPropertySchema = new mongoose.Schema({
    landSize: LandSizeSchema,
    location: PropertyLocationSchema,
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
            required: true
        },
        words: {
            type: String,
            required: true,
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
            required: true,
            trim: true
        },
        details: {
            type: String,
            trim: true
        }
    },
    legalRestrictions: LegalRestrictionsSchema,
    nearbyTown: {
        type: String,
        trim: true
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