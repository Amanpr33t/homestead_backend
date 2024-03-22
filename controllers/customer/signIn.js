require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Customer = require('../../models/customer')
const CustomAPIError = require('../../errors/custom-error')

//The function is used to signIn a customer
const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            throw new CustomAPIError('Please enter email and password ', StatusCodes.NO_CONTENT)
        }
        if (password.length > 10 || password.length < 6) {
            throw new CustomAPIError('Please enter email and password ', StatusCodes.BAD_REQUEST)
        }

        const customer = await Customer.findOne({ email })
        if (!customer) {
            return res.status(StatusCodes.OK).json({ status: 'not_found', msg: 'Enter valid credentials' })
        }

        const isPasswordCorrect = customer && await customer.comparePassword(password)
        if (!isPasswordCorrect) {
            return res.status(StatusCodes.OK).json({ status: 'incorrect_password', msg: 'Enter valid credentials' })
        }

        const authToken = await customer.createJWT()
        const oneDay = 1000 * 60 * 60 * 24

        await Customer.findOneAndUpdate({ email },
            {
                authTokenExpiration: Date.now() + oneDay
            },
            { new: true, runValidators: true })
        return res.status(StatusCodes.OK).json({
            status: 'ok',
            authToken
        })
    } catch (error) {
        next(error)
    }
}

//The function runs when a property dealer logs out
const logout = async (req, res, next) => {
    try {
        await Customer.findOneAndUpdate({ _id: req.customer._id },
            { authTokenExpiration: null },
            { new: true, runValidators: true })
        return res.status(StatusCodes.OK).json({
            status: 'ok',
            msg: 'Successfully logged out'
        })
    } catch (error) {
        next(error)
    }
}

const signUp = async (req, res, next) => {
    try {
        await Customer.create(req.body)
        return res.status(StatusCodes.OK).json({
            status: 'ok'
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    signIn,
    logout,
    signUp
}