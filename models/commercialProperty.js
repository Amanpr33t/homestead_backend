const mongoose = require('mongoose')
const Schema = mongoose.Schema
require('express-async-errors')

const LandSizeSchema = new mongoose.Schema({
    totalArea: {
        metreSquare: {
            type: Number,
            required: true
        },
        squareFeet: {
            type: Number,
            required: true
        }
    },
    coveredArea: {
        metreSquare: {
            type: Number,
            required: true
        },
        squareFeet: {
            type: Number,
            required: true
        }
    },
    details: {
        type: String,
        trim: true,
        default: null
    },
    _id: {
        type: Schema.Types.ObjectId,
        default: undefined,
    },
})

const PropertyLocationSchema = new mongoose.Schema({
    name: {
        plotNumber: {
            type: Number,
            default: null
        },
        village: {
            type: String,
            trim: true,
            default: null
        },
        city: {
            type: String,
            trim: true,
            default: null
        },
        tehsil: {
            type: String,
            trim: true,
            default: null
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

const CommercialPropertySchema = new mongoose.Schema({
    propertyType: {
        type: String,
        enum: ['commercial'],
        required: true,
        default: 'commercial'
    },
    commercialPropertyType: {
        type: String,
        enum: ['shop', 'industrial'],
        required: true,
        trim: true
    },
    stateOfProperty: {
        empty: {
            type: Boolean,
            required: true
        },
        builtUp: {
            type: Boolean,
            required: true
        },
        builtUpPropertyType: {
            type: String,
            enum: ['hotel/resort', 'factory', 'banquet hall', 'cold store', 'warehouse', 'school', 'hospital/clinic', 'other', null],
            trim: true,
            default: null
        }
    },
    landSize: LandSizeSchema,
    location: PropertyLocationSchema,
    floors: {
        floorsWithoutBasement: {
            type: Number,
            required: true
        },
        basementFloors: {
            type: Number,
            required: true
        }
    },
    widthOfRoadFacing: {
        feet: {
            type: Number,
            required: true
        },
        metre: {
            type: Number,
            required: true
        }
    },
    propertyImagesUrl: {
        type: [String],
        default: []
    },
    contractImagesUrl: {
        type: [String],
        default: null
    },
    numberOfOwners: {
        type: Number,
        required: true
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
    remarks: {
        type: String,
        trim: true,
        default: null
    },
    lockInPeriod: {
        years: {
            type: Number,
            default: null
        },
        months: {
            type: Number,
            default: null
        }
    },
    leasePeriod: {
        years: {
            type: Number,
            default: null
        },
        months: {
            type: Number,
            default: null
        }
    },
    shopPropertyType: {
        //Can be anyone of these: 'Booth', 'Shop', 'Showroom', 'Retail-space', 'other'
        type: String,
        enum: ['booth', 'shop', 'showroom', 'retail-space', 'other', null],
        trim: true,
        default: null
    },
    legalRestrictions: {
        isLegalRestrictions: {
            type: Boolean,
            required: true
        },
        details: {
            type: String,
            trim: true,
            default: null
        }
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
    cityManager: {
        type: mongoose.Types.ObjectId,
        ref: 'CityManager'
    },
    uniqueId: {
        type: String,
        required: true
    },
    
    sentToEvaluatorByFieldAgentForEvaluation: {
        isSent: {
            type: Boolean,
            default: true
        },
        date: {
            type: Date,
            default: null
        }
    },
    sentToEvaluatorByCityManagerForReevaluation: {
        isSent: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            default: null
        },
        details:{
            type: [String] 
        }
    },
    isEvaluatedSuccessfullyByEvaluator: {
        isEvaluated: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            default: null
        }
    },
    sentBackTofieldAgentForReevaluation: {
        isSent: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            default: null
        },
        details: {
            type: [String]
        },
        by: {
            type: String,
            enum: ['city-manager', 'evaluator'],
            trim: true,
        }
    },
    isApprovedByCityManager: {
        isApproved: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            default: null
        }
    },
    sentToCityManagerForApproval: {
        date: {
            type: Date,
            default: null
        },
        isSent: {
            type: Boolean,
            default: false
        }
    },
    numberOfReevaluationsReceivedByFieldAgent: {
        type: Number,
        default: 0
    },
    numberOfReevaluationsReceivedByEvaluator: {
        type: Number,
        default: 0
    },
    evaluationData: {
        typeOfLocation: { type: String, default: null },
        locationStatus: { type: String, default: null },
        fairValueOfProperty: { type: Number, default: null },
        fiveYearProjectionOfPrices: {
            increase: { type: Boolean, default: null },
            decrease: { type: Boolean, default: null },
            percentageIncreaseOrDecrease: { type: Number, default: null },
        },
        conditionOfConstruction: { type: String, default: null },
        qualityOfConstructionRating: { type: Number, default: null },
        evaluatedAt: { type: Date },
    },
    isLive: {
        type: Boolean,
        default: false
    },

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

module.exports = mongoose.model('CommercialProperty', CommercialPropertySchema)