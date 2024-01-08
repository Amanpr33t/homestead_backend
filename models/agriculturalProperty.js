const mongoose = require('mongoose')
const Schema = mongoose.Schema
require('express-async-errors')
const LandSizeSchema = new mongoose.Schema({
    size: {
        type: Number,
        required: true
    },
    unit: {
        //can be 'metre-square' or 'acre'
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
        //Can be any of these: 'Unpaved road', 'Village road', 'District road', 'State highway', 'National highway'
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
    propertyType: {
        type: String,
        default: 'agricultural'
    },
    landSize: LandSizeSchema,
    location: PropertyLocationSchema,
    roadConnectivity: RoadConnectivitySchema,
    propertyImagesUrl: {
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
        //Array can have any of the values: 'Sprinkler', 'Drip', 'Underground pipeline'
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
        //Array can have any of these values: 'Rice', 'Wheat', 'Maize', 'Cotton'
        type: Array,
        default: []
    },
    road: {
        type: {
            //Can be aynone of these: 'Unpaved road', 'Village road', 'District road', 'State highway', 'National highway
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
    },
    propertyEvaluator: {
        type: mongoose.Types.ObjectId,
        ref: 'PropertyEvaluator',
        required: [true, 'Please provide a property evaluator id']
    },
    uniqueId: {
        type: String,
        required: true
    },
    sentBackTofieldAgentForReevaluation: {
        type: Boolean,
        default: false
    },
    isEvaluatedSuccessfully: {
        type: Boolean,
        default: false
    },
    isSentForEvaluation: {
        type: Boolean,
        default: true
    },
    evaluationRequestDate: {
        type: Date
    },
    evaluationData: {
        photographs: {
            arePhotographsComplete: {
                type: Boolean,
                default: null
            },
            details: {
                type: String,
                default: null
            }
        },
        typeOfLocation: {
            //Can be any one of these: 'Rural', 'Sub-urban', 'Urban', 'Mixed-use', 'Industrial'
            type: String,
            default: null
        },
        locationStatus: {
            //Can be any of these: 'Posh', 'Premium', 'Popular', 'Ordinary', 'Low Income'
            type: String,
            default: null
        },
        fairValueOfProperty: {
            type: Number,
            default: null
        },
        fiveYearProjectionOfPrices: {
            increase: {
                type: Boolean,
                default: null
            },
            decrease: {
                type: Boolean,
                default: null
            },
            percentageIncreaseOrDecrease: {
                //Number from 0 to 100
                type: Number,
                default: null
            }
        },
        conditionOfConstruction: {
            //Can be anyone of these values: 'Newly built', 'Ready to move', 'Needs renovation', 'Needs repair'
            type: String,
            default: null
        },
        qualityOfConstructionRating: {
            //A number from 1 to 5
            type: Number,
            default: null
        },
        evaluatedAt: Date
    },
    numberOfReevaluationsReceived: {
        type: Number,
        default: 0
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

module.exports = mongoose.model('AgriculturalProperty', AgriculturalPropertySchema)