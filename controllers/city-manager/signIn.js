require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CityManager = require('../../models/cityManager')
const CustomAPIError = require('../../errors/custom-error')

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

        let cityManager
        if (email) {
            cityManager = await CityManager.findOne(identifier)
        } else {
            cityManager = await CityManager.findOne(identifier)
        }

        if (!cityManager) {
            throw new CustomAPIError('No user found ', StatusCodes.BAD_REQUEST)
        }

        if (password) {
            const isPasswordCorrect = cityManager && await cityManager.comparePassword(password)
            if (!isPasswordCorrect) {
                res.status(StatusCodes.OK).json({ status: 'incorrect_password', msg: 'Enter valid credentials' })
                return
            }
        } else if (otp) {
            if (cityManager.otpForVerification !== otp) {
                res.status(StatusCodes.OK).json({ status: 'incorrect_token', msg: 'Access denied' })
                return
            }

            await CityManager.findOneAndUpdate(identifier,
                {
                    otpForVerification: null
                },
                { new: true, runValidators: true })
        }

        const authToken = await cityManager.createJWT()
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