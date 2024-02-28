const mongoose = require('mongoose');

const { Schema } = mongoose;

/*const LandSizeSchema = new Schema({
    //agricultural property fieds
    size: Number,
    unit: {
        type: String,
        enum: ['metre-square', 'acre'],
        trim: true,
    },

    //commercial property fields
    totalArea: {
        metreSquare: Number,
        squareFeet: Number
    },
    coveredArea: {
        metreSquare: Number,
        squareFeet: Number
    },

    //fields common to agricultural, commercial property
    details: {
        type: String,
        trim: true
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
        trim: true,
    },
    details: {
        type: String,
        trim: true
    },
    _id: {
        type: Schema.Types.ObjectId,
        default: undefined,
    },
});

const LegalRestrictionsSchema = new Schema({
    isLegalRestrictions: Boolean,
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
    canal: [String],
    river: [String],
    tubewells: {
        numberOfTubewells: Number,
        depth: [Number],
    },
    _id: {
        type: Schema.Types.ObjectId,
        default: undefined,
    },
});

const ReservoirSchema = new Schema({
    isReservoir: Boolean,
    type: {
        type: [String],
        enum: ['public', 'private']
    },
    capacityOfPrivateReservoir: Number,
    unitOfCapacityForPrivateReservoir: {
        type: String,
        enum: ['cusec', 'litre', null]
    },
    _id: {
        type: Schema.Types.ObjectId,
        default: undefined,
    },
});*/

const PropertySchema = new Schema({
    //fields common to all property types
    title: {
        type: String,
        trim: true,
        required: true
    },
    details: {
        type: String,
        trim: true
    },
    propertyType: {
        type: String,
        enum: ['agricultural', 'residential', 'commercial'],
        required: true
    },
    location: {
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
                required: true,
            },
            state: {
                type: String,
                trim: true,
                required: true,
            },
        }
    },
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
    legalRestrictions: {
        isLegalRestrictions: Boolean,
        details: {
            type: String,
            trim: true,
        }
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
        required: [true, 'Please provide a evaluator id'],
    },
    cityManager: {
        type: mongoose.Types.ObjectId,
        ref: 'CityManager'
    },
    uniqueId: {
        type: String,
        required: true,
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
        details: {
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
    isSold: {
        type: Boolean,
        default: false
    },

    //fields common to commercial and agricultural property
    price: Number,

    //agricultural property fields
    landSize: {
        //agricultural property fieds
        size: Number,
        unit: {
            type: String,
            enum: ['metre-square', 'acre'],
            trim: true,
        },

        //commercial property fields
        totalArea: {
            metreSquare: Number,
            squareFeet: Number
        },
        coveredArea: {
            metreSquare: Number,
            squareFeet: Number
        },

        //fields common to agricultural, commercial property
        details: {
            type: String,
            trim: true
        }
    },
    road: {
        type: {
            type: String,
            enum: ['unpaved road', 'village road', 'district road', 'state highway', 'national highway'],
            trim: true,
        },
        details: {
            type: String,
            trim: true
        }
    },
    waterSource: {
        canal: [String],
        river: [String],
        tubewells: {
            numberOfTubewells: Number,
            depth: [Number],
        }
    },
    reservoir: {
        isReservoir: Boolean,
        type: {
            type: [String],
            enum: ['public', 'private']
        },
        capacityOfPrivateReservoir: Number,
        unitOfCapacityForPrivateReservoir: {
            type: String,
            enum: ['cusec', 'litre', null]
        }
    },
    irrigationSystem: {
        type: [String],
        enum: ['sprinkler', 'drip', 'underground pipeline']
    },
    crops: {
        type: [String],
        enum: ['rice', 'wheat', 'maize', 'cotton']
    },
    nearbyTown: {
        type: String,
        trim: true
    },

    //commercial property fields
    commercialPropertyType: {
        type: String,
        enum: ['shop', 'industrial'],
        trim: true
    },
    stateOfProperty: {
        empty: Boolean,
        builtUp: Boolean,
        builtUpPropertyType: {
            type: String,
            enum: ['hotel/resort', 'factory', 'banquet hall', 'cold store', 'warehouse', 'school', 'hospital/clinic', 'other', null],
            trim: true
        }
    },
    floors: {
        floorsWithoutBasement: Number,
        basementFloors: Number
    },
    widthOfRoadFacing: {
        feet: Number,
        metre: Number
    },
    lockInPeriod: {
        years: Number,
        months: Number
    },
    leasePeriod: {
        years: Number,
        months: Number
    },
    shopPropertyType: {
        //Can be anyone of these: 'Booth', 'Shop', 'Showroom', 'Retail-space', 'other'
        type: String,
        enum: ['booth', 'shop', 'showroom', 'retail-space', 'other', null],
        trim: true
    },

    //residential property fields
    //common fields to flat,house and plot property type
    residentialPropertyType: {
        type: String,
        enum: ['plot', 'flat', 'house'],
        trim: true
    },
    priceData: {
        fixed: Number,
        range: {
            from: Number,
            to: Number
        }
    },
    waterSupply: {
        available: Boolean,
        twentyFourHours: Boolean
    },
    electricityConnection: Boolean,
    sewageSystem: Boolean,
    cableTV: Boolean,
    highSpeedInternet: Boolean,
    distance: {
        //Unit is Km
        distanceFromGroceryStore: Number,
        distanceFromRestaurantCafe: Number,
        distanceFromExerciseArea: Number,
        distanceFromSchool: Number,
        distanceFromHospital: Number
    },
    areaType: {
        type: String,
        enum: ['rural', 'urban', 'sub-urban'],
        trim: true
    },
    area: {
        totalArea: {
            metreSquare: Number,
            gajj: Number
        },
        coveredArea: {
            metreSquare: Number,
            gajj: Number
        }
    },
    propertyTaxes: Number,
    homeOwnersAssociationFees: Number,

    //house specific fields
    typeOfSale: {
        floorForSale: Boolean,
        houseForSale: Boolean
    },

    //common fields only for house and flat
    numberOfFloors: Number,
    numberOfLivingRooms: Number,
    numberOfBedrooms: Number,
    numberOfOfficeRooms: Number,
    numberOfWashrooms: Number,
    numberOfKitchen: Number,
    numberOfCarParkingSpaces: Number,
    numberOfBalconies: Number,
    storeRoom: Boolean,
    servantRoom: Boolean,
    furnishing: {
        type: {
            type: String,
            enum: ['fully-furnished', 'semi-furnished', 'unfurnished'],
            trim: true
        },
        details: {
            type: String,
            trim: true
        }
    },
    kitchenFurnishing: {
        type: {
            type: String,
            enum: ['modular', 'semi-furnished', 'unfurnished'],
            trim: true
        },
        details: {
            trim: true,
            type: String
        }
    },
    kitchenAppliances: {
        available: Boolean,
        details: {
            type: String,
            trim: true
        }
    },
    washroomFitting: {
        type: String,
        enum: ['standard', 'premium', 'luxurious']
    },
    electricalFitting: {
        type: String,
        enum: ['standard', 'premium', 'luxurious']
    },
    flooringTypeArray: {
        type: [String],
        enum: ['cemented', 'marble', 'luxurious marble', 'standard tiles', 'premium tiles', 'luxurious tiles']
    },
    roofTypeArray: {
        type: [String],
        enum: ['standard', 'pop work', 'down ceiling']
    },
    wallTypeArray: {
        type: [String],
        enum: ['plaster', 'paint', 'premium paint', 'wall paper', 'pvc panelling', 'art work']
    },
    windowTypeArray: {
        type: [String],
        enum: ['standard', 'wood', 'premium material']
    },
    safetySystemArray: {
        type: [String],
        enum: ['cctv', 'glass break siren', 'entry sensor', 'motion sensor', 'panic button', 'keypad', 'keyfob', 'smoke detector', 'co detector', 'water sprinkler', 'doorbell camera']
    },
    garden: {
        available: Boolean,
        details: {
            type: String,
            trim: true
        }
    },
    ageOfConstruction: Number,
    conditionOfProperty: {
        type: String,
        enum: ['exceptionally new', 'near to new', 'some signs of agying', 'need some renovations', 'needs complete renovation']
    },

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = mongoose.model('Property', PropertySchema);
