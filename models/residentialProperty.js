const mongoose = require('mongoose')
const Schema = mongoose.Schema
require('express-async-errors')

const ResidentialPropertySchema = new mongoose.Schema({
    //common fields to flat,house and plot propert type
    propertyType: {
        type: String,
        default: 'residential'
    },
    residentialPropertyType: {
        type: String,
        enum: ['plot', 'flat', 'house'],
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    details: {
        type: String,
        trim: true,
        default: null
    },
    price: {
        fixed: {
            type: Number,
            default: null
        },
        range: {
            from: {
                type: Number,
                default: null
            },
            to: {
                type: Number,
                default: null
            }
        }
    },
    waterSupply: {
        available: {
            type: Boolean,
            required: true
        },
        twentyFourHours: {
            type: Boolean,
            default: null
        }
    },
    electricityConnection: {
        type: Boolean,
        required: true
    },
    sewageSystem: {
        type: Boolean,
        required: true
    },
    cableTV: {
        type: Boolean,
        required: true
    },
    highSpeedInternet: {
        type: Boolean,
        required: true
    },
    distance: {
        //Unit is Km
        distanceFromGroceryStore: {
            type: Number,
            required: true
        },
        distanceFromRestaurantCafe: {
            type: Number,
            required: true
        },
        distanceFromExerciseArea: {
            type: Number,
            required: true
        },
        distanceFromSchool: {
            type: Number,
            required: true
        },
        distanceFromHospital: {
            type: Number,
            required: true
        }
    },
    areaType: {
        type: String,
        enum: ['rural', 'urban', 'sub-urban'],
        required: true,
        trim: true
    },
    area: {
        totalArea: {
            metreSquare: {
                type: Number,
                required: true
            },
            gajj: {
                type: Number,
                required: true
            }
        },
        coveredArea: {
            metreSquare: {
                type: Number,
                required: true
            },
            gajj: {
                type: Number,
                required: true
            }
        }
    },
    numberOfOwners: {
        required: true,
        type: Number
    },
    legalRestrictions: {
        isLegalRestrictions: {
            required: true,
            type: Boolean
        },
        details: {
            type: String,
            trim: true,
            default: null
        },
    },
    propertyTaxes: {
        type: Number,
        default: null
    },
    homeOwnersAssociationFees: {
        type: Number,
        default: null
    },
    location: {
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
                required: true
            },
            state: {
                type: String,
                trim: true,
                required: true
            }
        },
    },
    propertyImagesUrl: {
        type: Array,
        default: []
    },
    contractImagesUrl: {
        type: Array,
        default: []
    },

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
            trim: true,
            default: null
        }
    },
    kitchenFurnishing: {
        type: {
            type: String,
            enum: ['modular' , 'semi-furnished', 'unfurnished'],
            trim: true
        },
        details: {
            trim: true,
            type: String,
            default: null
        }
    },
    kitchenAppliances: {
        available: Boolean,
        details: {
            type: String,
            trim: true,
            default: null
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
        enum: ['cctv', 'glass break siren', 'entry sensor', 'motion sensor', 'panic button', 'keypad', 'keyfob', 'smoke detector', 'co detector', 'water sprinkler', 'doorbell camera'],
        default: null
    },
    garden: {
        available: Boolean,
        details: {
            type: String,
            trim: true,
            default: null
        }
    },
    ageOfConstruction: Number,
    conditionOfProperty: {
        type: String,
        enum: ['exceptionally new', 'near to new', 'some signs of agying', 'need some renovations', 'needs complete renovation']
    },

    //common fields
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
    uniqueId: {
        type: String,
        required: true
    },
    propertyEvaluator: {
        type: mongoose.Types.ObjectId,
        ref: 'PropertyEvaluator',
        required: [true, 'Please provide a property evaluator id']
    },
    cityManager: {
        type: mongoose.Types.ObjectId,
        ref: 'CityManager',
        required: [true, 'Please provide a city manager id'],
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
        by: {
            type: String,
            enum: ['evaluator', 'city-manager'],
            trim: true,
        },
        isSent: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            default: null
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
    sentToEvaluatorByCityManagerForReevaluation: {
        isSent: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            default: null
        }
    },
    sentToCityManagerForApproval: {
        by: {
            type: String,
            enum: ['evaluator', 'field-agent'],
            trim: true
        },
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
    isLive: {
        type: Boolean,
        default: false
    },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

module.exports = mongoose.model('ResidentialProperty', ResidentialPropertySchema)