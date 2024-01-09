require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const CustomAPIError = require('../../errors/custom-error')

//The function is used to signIn a field agent
const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            throw new CustomAPIError('Please enter email and password ', StatusCodes.NO_CONTENT)
        }
        if (password.length > 10 || password.length < 6) {
            throw new CustomAPIError('Please enter email and password ', StatusCodes.BAD_REQUEST)
        }

        const propertyDealer = await PropertyDealer.findOne({ email })
        if (!propertyDealer) {
            return res.status(StatusCodes.OK).json({ status: 'not_found', msg: 'Enter valid credentials' })
        }
        
        const isPasswordCorrect = propertyDealer && await propertyDealer.comparePassword(password)
        if (!isPasswordCorrect) {
            return res.status(StatusCodes.OK).json({ status: 'incorrect_password', msg: 'Enter valid credentials' })
        }

        const authToken = await propertyDealer.createJWT()
        const oneDay = 1000 * 60 * 60 * 24
        
        await PropertyDealer.findOneAndUpdate({ email },
            { authTokenExpiration: Date.now() + oneDay },
            { new: true, runValidators: true })
        return res.status(StatusCodes.OK).json({ status: 'ok', authToken })

    } catch (error) {
        next(error)
    }
}

//The function runs when a field agent logs out
const logout = async (req, res, next) => {
    try {
        await PropertyDealer.findOneAndUpdate({ _id: req.propertyDealer._id },
            { authTokenExpiration: null },
            { new: true, runValidators: true })
        return res.status(StatusCodes.OK).json({ status: 'ok', msg: 'Successfully logged out' })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    signIn,
    logout
}