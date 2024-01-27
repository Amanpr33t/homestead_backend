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
    },
    stateWherePropertyIsLocated: {
        type: String,
        trim: true,
        required: true
    },
    yearOfPropertyAddition: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'active'
    }

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

module.exports = mongoose.model('CommercialProperty', CommercialPropertySchema)