const mongoose = require('mongoose')
const Schema = mongoose.Schema
require('express-async-errors')

const ResidentialPropertySchema = new mongoose.Schema({
    //common fields
    propertyType:{
        type:String,
        default:'residential'
    },
    residentialPropertyType: {
        type: String,
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
        trim: true
    },
    price: {
        fixed: {
            type: Number || null,
            default: null
        },
        range: {
            from: {
                type: Number || null,
                default: null
            },
            to: {
                type: Number || null,
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
            type: Boolean || null,
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
        },
    },
    propertyTaxes: {
        type: Number || null,
        default: null
    },
    homeOwnersAssociationFees: {
        type: Number || null,
        default: null
    },
    location: {
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
    },
    residentialLandImagesUrl: {
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

    //common fields for house and flat
    numberOfFloors: Number,
    numberOfLivingRooms: Number,
    numberOfBedrooms: Number,
    numberOfOfficeRooms: Number,
    numberOfWashrooms: Number,
    numberOfKitchen: Number,
    numberOfCarParkingSpaces: Number,
    numberOfBalconies: Number,
    storeRoom: Boolean,
    servantRoom: {
        room: Boolean,
        washroom: Boolean
    },
    /*furnishing: {
        type: {
            fullyFurnished: Boolean,
            semiFurnished: Boolean,
            unfurnished: Boolean
        },
        details: {
            type: String,
            trim: true
        }
    },
    kitchenFurnishing: {
        type: {
            modular: Boolean,
            semiFurnished: Boolean,
            unFurnished: Boolean
        },
        details: {
            trim: true,
            type: String
        }
    },*/
    furnishing: Object,
    kitchenFurnishing: Object,
    kitchenAppliances: {
        available: Boolean,
        details: {
            type: String,
            trim: true
        }
    },
    washroomFitting: {
        standard: Boolean,
        premium: Boolean,
        luxurious: Boolean
    },
    electricalFitting: {
        standard: Boolean,
        premium: Boolean,
        luxurious: Boolean
    },
    flooringTypeArray: Array,
    roofTypeArray: Array,
    wallTypeArray: Array,
    windowTypeArray: Array,
    safetySystemArray: Array,
    garden: {
        available: Boolean,
        details: {
            type: String,
            trim: true
        }
    },
    ageOfConstruction: Number,
    conditionOfProperty: String,

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
    isEvaluatedSuccessfully: {
        type: Boolean,
        default: false
    },
    sentBackTofieldAgentForReevaluation: {
        type: Boolean,
        default: false
    },
    evaluationData: {
        information: {
            isInformationComplete: {
                type: Boolean,
                default: null
            },
            details: {
                type: Array
            }
        },
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
            type: String,
            default: null
        },
        locationStatus: {
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
                type: Number,
                default: null
            }
        },
        conditionOfConstruction: {
            type: String,
            default: null
        },
        qualityOfConstructionRating: {
            type: Number,
            default: null
        },
        evaluatedAt: Date
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

module.exports = mongoose.model('ResidentialProperty', ResidentialPropertySchema)