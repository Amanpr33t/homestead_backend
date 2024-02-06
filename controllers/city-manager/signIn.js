require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CityManager = require('../../models/cityManager')
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

        const cityManager = await CityManager.findOne({ email })
        if (!cityManager) {
            return res.status(StatusCodes.OK).json({ status: 'not_found', msg: 'Enter valid credentials' })
        }

        const isPasswordCorrect = cityManager && await cityManager.comparePassword(password)
        if (!isPasswordCorrect) {
            return res.status(StatusCodes.OK).json({ status: 'incorrect_password', msg: 'Enter valid credentials' })
        }

        const authToken = await cityManager.createJWT()
        const oneDay = 1000 * 60 * 60 * 24

        await CityManager.findOneAndUpdate({ email },
            { authTokenExpiration: Date.now() + oneDay },
            { new: true, runValidators: true })
        return res.status(StatusCodes.OK).json({ status: 'ok', authToken })

    } catch (error) {
        next(error)
    }
}

const logout = async (req, res, next) => {
    try {
        await CityManager.findOneAndUpdate({ _id: req.cityManager.cityManagerId },
            { authTokenExpiration: null },
            { new: true, runValidators: true })
        return res.status(StatusCodes.OK).json({ status: 'ok', msg: 'Successfully logged out' })
    } catch (error) {
        next(error)
    }
}

//to be deleted
const signup = async (req, res, next) => {
    try {

        const { email, password } = req.body
        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ status: 'noEmailPassword', msg: 'Please enter email and password' })
        }
        const emailExists = await CityManager.findOne({ email })
        if (emailExists) {
            return res.status(StatusCodes.BAD_REQUEST).json({ status: 'emailExists', msg: 'Email already exists' })
        }
        const cityManager = await CityManager.create(req.body)
        const authToken = await cityManager.createJWT()
        return res.status(StatusCodes.CREATED).json({ status: 'ok', msg: 'Account has been created', authToken })

    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = {
    signIn,
    logout,
    signup
}