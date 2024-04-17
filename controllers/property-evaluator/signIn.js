require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyEvaluator = require('../../models/propertyEvaluator')
const CustomAPIError = require('../../errors/custom-error')

//The function is used to sign in a property evaluator
const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            throw new CustomAPIError('Please enter email and password ', StatusCodes.NO_CONTENT)
        }
        if (password.length > 10 || password.length < 6) {
            throw new CustomAPIError('Please enter email and password ', StatusCodes.BAD_REQUEST)
        }

        const propertyEvaluator = await PropertyEvaluator.findOne({ email })
        if (!propertyEvaluator) {
            return res.status(StatusCodes.OK).json({ status: 'not_found', msg: 'Enter valid credentials' })
        }

        const isPasswordCorrect = propertyEvaluator && await propertyEvaluator.comparePassword(password)
        if (!isPasswordCorrect) {
            return res.status(StatusCodes.OK).json({ status: 'incorrect_password', msg: 'Enter valid credentials' })
        }

        const authToken = await propertyEvaluator.createJWT()
        const oneDay = 1000 * 60 * 60 * 24

        await PropertyEvaluator.findOneAndUpdate({ email },
            { authTokenExpiration: Date.now() + oneDay },
            { new: true, runValidators: true })
        return res.status(StatusCodes.OK).json({ status: 'ok', authToken })

    } catch (error) {
        next(error)
    }
}

module.exports = {
    signIn
}