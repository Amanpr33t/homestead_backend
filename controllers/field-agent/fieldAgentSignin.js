require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const FieldAgent = require('../../models/fieldAgent')
const CustomAPIError = require('../../errors/custom-error')
const emailValidator = require("email-validator");

const signIn = async (req, res, next) => {
    try {
        const {
            email,
            contactNumber,
            otp,
            password
        } = req.body

        console.log(req.body)

        if ((password && otp) || (!otp && !password)) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        if ((email && contactNumber) || (!email && !contactNumber)) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        let identifier
        if (email) {
            identifier = { email }
        } else if (contactNumber) {
            identifier = { contactNumber }
        }

        let fieldAgent
        if (email) {
            fieldAgent = await FieldAgent.findOne(identifier)
        } else {
            fieldAgent = await FieldAgent.findOne(identifier)
        }

        if (!fieldAgent) {
            throw new CustomAPIError('No user found ', StatusCodes.BAD_REQUEST)
        }

        if (password) {
            const isPasswordCorrect = fieldAgent && await fieldAgent.comparePassword(password)
            if (!isPasswordCorrect) {
                res.status(StatusCodes.OK).json({ status: 'incorrect_password', msg: 'Enter valid credentials' })
                return
            }
        } else if (otp) {
            if (fieldAgent.otpForVerification !== otp) {
                res.status(StatusCodes.OK).json({ status: 'incorrect_token', msg: 'Access denied' })
                return
            }

            await FieldAgent.findOneAndUpdate(identifier,
                {
                    otpForVerification: null
                },
                { new: true, runValidators: true })
        }

        const authToken = await fieldAgent.createJWT()
        return res.status(StatusCodes.OK).json({
            status: 'ok',
            authToken
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = {
    signIn
}