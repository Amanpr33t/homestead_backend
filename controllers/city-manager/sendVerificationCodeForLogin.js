require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CityManager= require('../../models/cityManager')
const sendEmail = require('../../utils/sendEmail')
const CustomAPIError = require('../../errors/custom-error')

//This function is used to send OTP to the registered email of the dealer.
const sendVerificationCodeForCityManagerVerification = async (req, res, next) => {
    try {
        const { email, contactNumber } = req.body

        if (!email && !contactNumber) {
            throw new CustomAPIError('Email not provided', StatusCodes.BAD_REQUEST)
        }

        let doesUserExist
        if (email) {
            doesUserExist = await CityManager.countDocuments({ email: req.body.email })
        } else if (contactNumber) {
            doesUserExist = await CityManager.countDocuments({ contactNumber: req.body.contactNumber })
        }

        if (!doesUserExist) {
            res.status(StatusCodes.OK).json({
                status: 'invalid-details',
                msg: 'No user with this email or contact number exists'
            })
            return
        }

        // Generate a 6 digit OTP
        const otpForVerification = Math.floor(100000 + Math.random() * 900000).toString();
        const msg = `<p>OTP for user verification for sign in: <h2>${otpForVerification}</h2></p>`

        if (email) {
            const emailData = {
                from: process.env.ADMIN_EMAIL,
                to: email,
                subject: "OTP for user verification",
                msg
            }
            await sendEmail(emailData) //sendEmail function is imported from utils folder
        } else if (contactNumber) {

        }

        //const tenMinutes = 1000 * 60 * 10

        //const otpForVerificationExpirationDate = new Date(Date.now() + tenMinutes) //This variable is used to set the expiration date of the OTP

        //The query below is used to update the otpForVerification and otpForVerificationExpirationDate fields in the dealers document
        await CityManager.findOneAndUpdate({ email },
            {
                otpForVerification,
                //otpForVerificationExpirationDate
            },
            { new: true, runValidators: true })

        res.status(StatusCodes.OK).json({
            status: 'ok',
            msg: 'A verification token has been sent to your email'
        })
        return
    } catch (error) {
        next(error)
    }
}

//This function is used to confirm the OTP sent by the user
const confirmVerificationCodeForCityManagerVerification = async (req, res, next) => {
    try {
        const {
            email,
            contactNumber,
            otp
        } = req.body

        //Out of email, contactNumber and uniqueId only 1 should be received. This if statement throws an error if more than 1 items are available
        if ((!email && !contactNumber) || !otp) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        let dealer //This variable will store the dealers data fetched from database

        //The if statements run depending upon the availability of email, uniqueId and contactNumber
        if (email) {
            dealer = await CityManager.findOne({ email })
        } else if (contactNumber) {
            dealer = await CityManager.findOne({ contactNumber })
        }

        if (!dealer) {
            throw new CustomAPIError('CityManagerwith this email or contact number does not exist', StatusCodes.NOT_FOUND)
        }

        if (dealer.otpForVerification !== otp) {
            res.status(StatusCodes.OK).json({ status: 'incorrect_token', msg: 'Access denied' })
            return
        }

        const authToken = await dealer.createJWT()

        let identifier
        if (email) {
            identifier = { email }
        } else if (contactNumber) {
            identifier = { contactNumber }
        }

        //The code below is used to update the dealer document in the database once the OTP has been successfully verified
        await CityManager.findOneAndUpdate(identifier,
            {
                otpForVerification: null,
                //otpForVerificationExpirationDate: null
            },
            { new: true, runValidators: true })

        res.status(StatusCodes.OK).json({
            status: 'ok',
            msg: 'OTP has been verified',
            authToken
        })
        return
    } catch (error) {
        next(error)
    }
}

module.exports = {
    sendVerificationCodeForCityManagerVerification,
    confirmVerificationCodeForCityManagerVerification
}