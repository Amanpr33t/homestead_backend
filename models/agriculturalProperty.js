const mongoose = require('mongoose');

const { Schema } = mongoose;

const LandSizeSchema = new Schema({
    size: {
        type: Number,
        required: true,
    },
    unit: {
        type: String,
        enum: ['metre-square', 'acre'],
        required: true,
        trim: true,
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
});

const RoadSchema = new Schema({
    type: {
        type: String,
        enum: ['unpaved road', 'village road', 'district road', 'state highway', 'national highway'],
        required: true,
        trim: true,
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
});

const LegalRestrictionsSchema = new Schema({
    isLegalRestrictions: {
        type: Boolean,
        required: true,
    },
    details: {
        type: String,
        trim: true,
    },
    _id: {
        type: Schema.Types.ObjectId,
        default: undefined,
    },
});

const PropertyLocationSchema = new Schema({
    name: {
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
            required: true,
        },
        state: {
            type: String,
            trim: true,
            required: true,
        },
    },
    _id: {
        type: Schema.Types.ObjectId,
        default: undefined,
    },
});

const WaterSourceSchema = new Schema({
    canal: {
        type: [String],
        default: null
    },
    river: {
        type: [String],
        default: null
    },
    tubewells: {
        numberOfTubewells: {
            type: Number,
            required: true,
        },
        depth: {
            type: [Number],
            default: null
        },
    },
    _id: {
        type: Schema.Types.ObjectId,
        default: undefined,
    },
});

const ReservoirSchema = new Schema({
    isReservoir: {
        type: Boolean,
        required: true,
    },
    type: {
        type: [String],
        enum: ['public', 'private'],
        default: null
    },
    capacityOfPrivateReservoir: {
        type: Number,
        default: null
    },
    unitOfCapacityForPrivateReservoir: {
        type: String,
        enum: ['cusec', 'litre', null],
        default: null
    },
    _id: {
        type: Schema.Types.ObjectId,
        default: undefined,
    },
});

const AgriculturalPropertySchema = new Schema({
    propertyType: {
        type: String,
        enum: ['agricultural'],
        required: true,
        default: 'agricultural'
    },
    landSize: LandSizeSchema,
    location: PropertyLocationSchema,
    road: RoadSchema,
    propertyImagesUrl: {
        type: [String],
        default: [],
    },
    contractImagesUrl: {
        type: [String],
        default: null
    },
    numberOfOwners: {
        type: Number,
        required: true,
    },
    waterSource: WaterSourceSchema,
    reservoir: ReservoirSchema,
    irrigationSystem: {
        type: [String],
        enum: ['sprinkler', 'drip', 'underground pipeline'],
        default: null
    },
    priceDemanded: {
        number: { type: Number, required: true },
        words: { type: String, required: true, trim: true },
    },
    crops: {
        type: [String],
        enum: ['rice', 'wheat', 'maize', 'cotton'],
        default: [],
    },
    legalRestrictions: LegalRestrictionsSchema,
    nearbyTown: {
        type: String,
        trim: true,
        default: null
    },
    addedByFieldAgent: {
        type: mongoose.Types.ObjectId,
        ref: 'FieldAgent',
        required: [true, 'Please provide a field agent id'],
    },
    addedByPropertyDealer: {
        type: mongoose.Types.ObjectId,
        ref: 'PropertyDealer',
        required: [true, 'Please provide a property dealer id'],
    },
    propertyEvaluator: {
        type: mongoose.Types.ObjectId,
        ref: 'PropertyEvaluator',
        required: [true, 'Please provide a property evaluator id'],
    },
    uniqueId: {
        type: String,
        required: true,
    },
    sentBackTofieldAgentForReevaluationByEvaluator: {
        isSent: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            default: null
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
    sentToEvaluatorByFieldAgentForEvaluation: {
        isSent: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            default: null
        }
    },
    evaluationData: {
        areDetailsComplete: { type: Boolean },
        incompletePropertyDetails: { type: [String], default: null },
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
    numberOfReevaluationsReceivedByFieldAgent: {
        fromEvaluator: {
            type: Number,
            default: 0
        }
    },
    status: { type: String, default: 'active' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = mongoose.model('AgriculturalProperty', AgriculturalPropertySchema);
