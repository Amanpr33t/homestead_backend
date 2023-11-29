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
        trim: true
    },
    _id: {
        type: Schema.Types.ObjectId,
        default: undefined,
    },
})
const PropertyLocationSchema = new mongoose.Schema({
    name: {
        plotNumber: {
            type: String,
            trim: true
        },
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

const CommercialPropertySchema = new mongoose.Schema({
    commercialPropertyType: {
        type: String,
        required: true,
        trim: true
    },
    stateOfProperty:{
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
            trim: true
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
            type: Number
        },
        metre: {
            type: Number
        }
    },
    commercialLandImagesUrl: {
        type: Array,
        default: []
    },
    contractImagesUrl: {
        type: Array,
        default: []
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
        trim: true
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
        type: String,
        trim: true
    },
    legalRestrictions:{
        isLegalRestrictions: {
            type: Boolean,
            required: true
        },
        details: {
            type: String,
            trim: true
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
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

module.exports = mongoose.model('CommercialProperty', CommercialPropertySchema)