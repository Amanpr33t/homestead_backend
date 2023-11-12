require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const crypto = require('crypto')
const sendEmail = require('../../utils/sendEmail')
const CustomAPIError = require('../../errors/custom-error')
const origin = process.env.ORIGIN
const emailValidator = require("email-validator");

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

        const dealer = await PropertyDealer.findOne(email ? { email: email.trim() } : { contactNumber: contactNumber.trim() })

        if (!dealer) {
            throw new CustomAPIError('Dealer with this email or contact number does not exist', 204)
        }
        if (dealer.otpForVerification !== otp) {
            return res.status(StatusCodes.OK).json({ status: 'incorrect_token', msg: 'Access denied' })
        }

        if (dealer.otpForVerificationExpirationDate.getTime() <= Date.now()) {
            return res.status(StatusCodes.OK).json({ status: 'token_expired', msg: 'Token expired' })
        }

        return res.status(StatusCodes.OK).json({ status: 'ok', msg: 'OTP has been verified', dealer })
    } catch (error) {
        next(error)
    }
}

const addProperty = async (req, res, next) => {
    try {
        req.body.addedByFieldAgent = req.fieldAgent._id
        const {
            landsize,
            roadConnectivity,
            waterSource,
            suitableCrops,
            privateReservoir,
            legalRestrictions,
            electricityConnections,
            numberOfOwners,
            numberOfTubewells,
            propertyLocation,
            propertyImage,
            addedByPropertyDealer,
            irrigationSystem
        } = req.body

        if (!waterSource.length || !suitableCrops.length || !electricityConnections || !numberOfOwners || !numberOfTubewells || privateReservoir === undefined || !propertyImage.length || !addedByPropertyDealer || !landsize || !roadConnectivity) {
            throw new CustomAPIError('Insufficient data', 204)
        }
        if (!landsize.metreSquare && !landsize.acre) {
            throw new CustomAPIError('Insufficient data', 204)
        }
        if (!roadConnectivity.roadType) {
            throw new CustomAPIError('Insufficient data', 204)
        }
        if (legalRestrictions.isLegalRestrictions === undefined) {
            throw new CustomAPIError('Insufficient data', 204)
        }
        if (!propertyLocation.state || !propertyLocation.district) {
            throw new CustomAPIError('Insufficient data', 204)
        }

        await AgriculturalProperty.create(req.body)
        return res.status(StatusCodes.OK).json({ status: 'ok', message: 'property has been added' })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    propertyDealerExists, sendOtpToEmailForDealerVerification, confirmOtpForDealerVerification, addProperty
}