require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const FieldAgent = require('../../models/fieldAgent')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const CustomAPIError = require('../../errors/custom-error')
const origin = process.env.ORIGIN

const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            throw new CustomAPIError('Please enter email and password ', 204)
        }
        if (password.length > 10 || password.length < 6) {
            throw new CustomAPIError('Please enter email and password ', 400)
        }

        const fieldAgent = await FieldAgent.findOne({ email })
        const isPasswordCorrect = fieldAgent && await fieldAgent.comparePassword(password)

        if (!fieldAgent) {
            return res.status(StatusCodes.OK).json({ status: 'not_found', msg: 'Enter valid credentials' })
        }

        if (!isPasswordCorrect) {
            return res.status(StatusCodes.OK).json({ status: 'incorrect_password', msg: 'Enter valid credentials' })
        }
        const authToken = await fieldAgent.createJWT()
        const oneDay = 1000 * 60 * 60 * 24
        await FieldAgent.findOneAndUpdate({ email },
            { authTokenExpiration: Date.now() + oneDay },
            { new: true, runValidators: true })
        return res.status(StatusCodes.OK).json({ status: 'ok', authToken })

    } catch (error) {
        next(error)
    }
}

const logout = async (req, res, next) => {
    try {
        await FieldAgent.findOneAndUpdate({ _id: req.fieldAgent.fieldAgentId },
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
        const emailExists = await FieldAgent.findOne({ email })
        if (emailExists) {
            return res.status(StatusCodes.BAD_REQUEST).json({ status: 'emailExists', msg: 'Email already exists' })
        }
        const fieldAgent = await FieldAgent.create({ email, password })
        const authToken = await fieldAgent.createJWT()
        return res.status(StatusCodes.CREATED).json({ status: 'ok', msg: 'Account has been created', authToken })

    } catch (error) {
        next(error)
    }

}

module.exports = {
    signIn,
    logout,
    signup
}