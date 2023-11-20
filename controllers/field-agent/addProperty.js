const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const FieldAgent = require('../../models/fieldAgent')
const crypto = require('crypto')
const sendEmail = require('../../utils/sendEmail')
const CustomAPIError = require('../../errors/custom-error')
const emailValidator = require("email-validator");
const { ObjectId } = require('mongodb')

const propertyDealerExists = async (req, res, next) => {
    try {
        const { email, contactNumber } = req.query
        let dealer
        if (contactNumber && contactNumber.trim()) {
            dealer = await PropertyDealer.findOne({ contactNumber })
        }
        if (email && email.trim()) {
            if (!emailValidator.validate(email.trim())) {
                throw new CustomAPIError('Email not in correct format', 204)
            }
            dealer = await PropertyDealer.findOne({ email: email.trim() })
        }
        if (!dealer) {
            return res.status(StatusCodes.OK).json({ status: 'noDealerExists', message: 'No dealer with this email or contact number exists' })
        }
        req.body.email = dealer.email
        next()
    } catch (error) {
        next(error)
    }
}

const sendOtpToEmailForDealerVerification = async (req, res, next) => {
    try {
        const { email } = req.body

        const otpForVerification = crypto.randomBytes(3).toString('hex')
        const msg = `<p>OTP for dealer verification to add property is: <h2>${otpForVerification}</h2></p>`

        const emailData = {
            from: process.env.ADMIN_EMAIL,
            to: email.trim(),
            subject: "OTP for dealer verification",
            msg
        }

        await sendEmail(emailData)

        const tenMinutes = 1000 * 60 * 10

        const otpForVerificationExpirationDate = new Date(Date.now() + tenMinutes)
        await PropertyDealer.findOneAndUpdate({ email },
            { otpForVerification, otpForVerificationExpirationDate },
            { new: true, runValidators: true })

        return res.status(StatusCodes.OK).json({ status: 'ok', msg: 'A verification token has been sent to your email' })
    } catch (error) {
        next(error)
    }
}

const confirmOtpForDealerVerification = async (req, res, next) => {
    try {
        const { email, contactNumber, otp } = req.query

        const dealer = await PropertyDealer.findOne(email ? { email: email.trim() } : { contactNumber: +contactNumber.trim() })

        if (!dealer) {
            throw new CustomAPIError('Dealer with this email or contact number does not exist', 204)
        }
        if (dealer.otpForVerificationExpirationDate.getTime() <= Date.now()) {
            return res.status(StatusCodes.OK).json({ status: 'token_expired', msg: 'Token expired' })
        }
        if (dealer.otpForVerification !== otp) {
            return res.status(StatusCodes.OK).json({ status: 'incorrect_token', msg: 'Access denied' })
        }

        await PropertyDealer.findOneAndUpdate(email ? { email: email.trim() } : { contactNumber: +contactNumber.trim() },
            {
                otpForVerification: null, otpForVerificationExpirationDate: null
            },
            { new: true, runValidators: true })

        return res.status(StatusCodes.OK).json({
            status: 'ok', msg: 'OTP has been verified', dealer: {
                dealerId: dealer._id,
                firmName: dealer.firmName,
                firmLogoUrl: dealer.firmLogoUrl
            }
        })
    } catch (error) {
        next(error)
    }
}



const addAgriculturalProperty = async (req, res, next) => {
    try {
        console.log(req.body)
        req.body.addedByFieldAgent = req.fieldAgent._id

        const { waterSource, reservoir, irrigationSystem, crops, road, legalRestrictions, agriculturalLandImagesUrl } = req.body

        if (!waterSource.canal.length && !waterSource.river.length && !waterSource.tubewells.numberOfTubewells) {
            throw new CustomAPIError('Water source information not provided', 204)
        }
        if (reservoir.isReservoir) {
            if (!reservoir.type.length) {
                throw new CustomAPIError('No reservoir type provided', 204)
            }
            if (reservoir.type.length > 2) {
                throw new CustomAPIError('Illegal reservoir type information', 204)
            }
            reservoir.type.forEach(type => {
                if (type.trim().toLowerCase() !== 'private' && type.trim().toLowerCase() !== 'public') {
                    throw new CustomAPIError('Incorrect type information', 204)
                }
            })
            if (reservoir.type.includes('private') && (!reservoir.capacityOfPrivateReservoir || (reservoir.unitOfCapacityForPrivateReservoir !== 'cusec' && reservoir.unitOfCapacityForPrivateReservoir !== 'litre'))) {
                throw new CustomAPIError('Incorrect inforamtion regarding capacity and ', 204)
            }
        }
        irrigationSystem.forEach(system => {
            if (system.trim() !== 'sprinkler' && system.trim() !== 'drip' && system.trim() !== 'underground pipeline') {
                throw new CustomAPIError('Wrong irrigation sysyem information', 204)
            }
        })
        if (!crops.length) {
            throw new CustomAPIError('No crops provided', 204)
        }
        crops.forEach(crop => {
            if (crop.trim() !== 'rice' && crop.trim() !== 'maize' && crop.trim() !== 'cotton' && crop.trim() !== 'wheat') {
                throw new CustomAPIError('Wrong crop information', 204)
            }
        })
        if (!road.type.length || (road.type !== 'unpaved road' && road.type !== 'village road' && road.type !== 'district road' && road.type !== 'state highway' && road.type !== 'national highway')) {
            throw new CustomAPIError('Wrong road information', 204)
        }
        if (legalRestrictions.isLegalRestrictions && !legalRestrictions.details) {
            throw new CustomAPIError('Details of legal restrictions not provided', 204)
        }
        if (!agriculturalLandImagesUrl.length) {
            throw new CustomAPIError('No land images provided', 204)
        }
        console.log(req.body)
        const property = await AgriculturalProperty.create(req.body)

        const fieldAgent = req.fieldAgent
        const updatedAgriculturalPropertiesFieldAgent = [...fieldAgent.propertiesAdded.agricultural, property._id]
        updatedPropertiesFieldAgent = {
            agricultural: updatedAgriculturalPropertiesFieldAgent,
            commercial: fieldAgent.propertiesAdded.commercial,
            residential: fieldAgent.propertiesAdded.residential
        }
        await FieldAgent.findOneAndUpdate({ _id: req.fieldAgent._id },
            { propertiesAdded: updatedPropertiesFieldAgent },
            { new: true, runValidators: true })


        const propertyDealer = await PropertyDealer.findOne({ id: req.body.addedByPropertyDealer })
        const updatedAgriculturalPropertiesPropertyDealer = [...propertyDealer.propertiesAdded.agricultural, property._id]
        updatedPropertiesPropertyDealer = {
            agricultural: updatedAgriculturalPropertiesPropertyDealer,
            commercial: propertyDealer.propertiesAdded.commercial,
            residential: propertyDealer.propertiesAdded.residential
        }
        await PropertyDealer.findOneAndUpdate({ _id: req.body.addedByPropertyDealer },
            { propertiesAdded: updatedPropertiesPropertyDealer },
            { new: true, runValidators: true })

        return res.status(StatusCodes.OK).json({ status: 'ok', message: 'Agricultural property has been added' })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    propertyDealerExists, sendOtpToEmailForDealerVerification, confirmOtpForDealerVerification, addAgriculturalProperty
}