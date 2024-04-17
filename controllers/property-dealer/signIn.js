require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyEvaluator = require('../../models/propertyEvaluator')
const CustomAPIError = require('../../errors/custom-error')

//The function is used to signIn a property dealer
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

        let propertyEvaluator
        if (email) {
            propertyEvaluator = await PropertyEvaluator.findOne(identifier)
        } else {
            propertyEvaluator = await PropertyEvaluator.findOne(identifier)
        }

        if (!propertyEvaluator) {
            throw new CustomAPIError('No user found ', StatusCodes.BAD_REQUEST)
        }

        if (password) {
            const isPasswordCorrect = propertyEvaluator && await propertyEvaluator.comparePassword(password)
            if (!isPasswordCorrect) {
                res.status(StatusCodes.OK).json({ status: 'incorrect_password', msg: 'Enter valid credentials' })
                return
            }
        } else if (otp) {
            if (propertyEvaluator.otpForVerification !== otp) {
                res.status(StatusCodes.OK).json({ status: 'incorrect_token', msg: 'Access denied' })
                return
            }

            await PropertyEvaluator.findOneAndUpdate(identifier,
                {
                    otpForVerification: null
                },
                { new: true, runValidators: true })
        }

        const authToken = await propertyEvaluator.createJWT()
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