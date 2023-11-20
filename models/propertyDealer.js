const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const AddressSchema = new mongoose.Schema({
    flatPlotHouseNumber: {
        type: String,
        trim: true,
        required: [true, 'Provide flat/plot/house number']
    },
    areaSectorVillage: {
        type: String,
        trim: true,
        required: [true, 'Provide area/sector/village']
    },
    landmark: {
        type: String,
        trim: true
    },
    postalCode: {
        type: Number,
        required: [true, 'Provide postal code']
    },
    city: {
        type: String,
        trim: true,
        required: [true, 'Provide city']
    },
    state: {
        type: String,
        trim: true,
        required: [true, 'Provide state']
    },
    district: {
        type: String,
        trim: true,
        required: [true, 'Provide district']
    },
    _id: {
        type: Schema.Types.ObjectId,
        default: undefined,
    },
})

const PropertyDealerSchema = new mongoose.Schema({
    firmName: {
        type: String,
        required: [true, 'Please provide a firm name'],
        trim: true
    },
    propertyDealerName: {
        type: String,
        required: [true, 'Please provide property dealers name'],
        trim: true
    },
    propertiesAdded: {
        agricultural: {
            type: Array,
            default: []
        },
        commercial: {
            type: Array,
            default: []
        },
        residential: {
            type: Array,
            default: []
        }
    },
    firmLogoUrl: {
        type: String
    },
    about: {
        type: String,
        trim: true
    },
    experience: {
        type: Number,
        required: [true, 'Please add experience']
    },
    addressArray: [AddressSchema],
    gstNumber: {
        type: String,
        required: [true, 'Please add gst number'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        trim: true
    },
    contactNumber: {
        type: String,
        required: [true, 'Please provide a contact number'],
        trim: true
    },
    addedByFieldAgent: {
        type: mongoose.Types.ObjectId,
        ref: 'FieldAgent',
        required: [true, 'Please provide a field agent id']
    },
    otpForVerification: {
        type: String,
        default: null
    },
    otpForVerificationExpirationDate: {
        type: Date,
        default: null
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })


module.exports = mongoose.model('PropertyDealer', PropertyDealerSchema)