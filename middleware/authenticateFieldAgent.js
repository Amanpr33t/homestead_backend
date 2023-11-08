const FieldAgent = require('../models/fieldAgent')
const jwt = require('jsonwebtoken')
const CustomAPIError = require('../errors/custom-error')
require('dotenv').config()
const { StatusCodes } = require('http-status-codes')

const authenticateFieldAgent = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(StatusCodes.OK).json({ status: 'invalid_authentication' })
        }
        const token = authHeader.split(' ')[1]
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        if (!payload) {
            return res.status(StatusCodes.OK).json({ status: 'invalid_authentication' })
        }

        const fieldAgent = await FieldAgent.findOne({ _id: payload.fieldAgentId })
        if (!fieldAgent) {
            return res.status(StatusCodes.OK).json({ status: 'invalid_authentication' })
        }
        if (fieldAgent.authTokenExpiration < new Date()) {
            await FieldAgent.findOneAndUpdate({ _id: payload.fieldAgentId },
                { authTokenExpiration: null },
                { new: true, runValidators: true })
            return res.status(StatusCodes.OK).json({ status: 'invalid_authentication' })
        }
        req.fieldAgent = fieldAgent
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = authenticateFieldAgent
