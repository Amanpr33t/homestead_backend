const mongoose = require('mongoose')
const Schema = mongoose.Schema
require('express-async-errors')

const ResidentialPropertySchema = new mongoose.Schema({
    //common fields
    propertyType: {
        type: String,
        default: 'residential'
    },
    residentialPropertyType: {
        //Can be anyone of these: 'Plot', 'Flat', 'House'
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
        //Can be anyone of these: 'Rural', 'Urban', 'Sub-Urban
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
    flooringTypeArray: Array,//Can be any of these: 'Cemented', 'Marble', 'Luxurious Marble', 'Standard tiles', 'Premium tiles', 'Luxurious tiles'
    roofTypeArray: Array,//Can be any of these: 'Standard', 'POP work', 'Down ceiling'
    wallTypeArray: Array,//Can be any of these: 'Plaster', 'Paint', 'Premium paint', 'Wall paper', 'PVC panelling', 'Art work'
    windowTypeArray: Array,//Can be any of these: 'Standard', 'Wood', 'Premium material'
    safetySystemArray: Array,//Can be any of these: 'CCTV', 'Glass break siren', 'Entry sensor', 'Motion sensor', 'Panic button', 'Keypad', 'Keyfob', 'Smoke detector', 'CO detector', 'Water sprinkler', 'Doorbell camera'
    garden: {
        available: Boolean,
        details: {
            type: String,
            trim: true
        }
    },
    ageOfConstruction: Number,
    conditionOfProperty: String, //Can be anyone of these: 'Exceptionally new', 'Near to new', 'Some signs of agying', 'Need some renovations', 'Needs complete renovation'

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
    sentBackTofieldAgentForReevaluation: {
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
    isEvaluatedSuccessfully: {
        type: Boolean,
        default: false
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

module.exports = mongoose.model('ResidentialProperty', ResidentialPropertySchema)