const FieldAgent = require('../models/fieldAgent')
const jwt = require('jsonwebtoken')
const CustomAPIError = require('../errors/custom-error')
require('dotenv').config()
const { StatusCodes } = require('http-status-codes')

//authentication with headers
const authenticateFieldAgent = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new CustomAPIError('Authentication invalid', 401)
        }
        const token = authHeader.split(' ')[1]

        const payload = jwt.verify(token, process.env.JWT_SECRET)

        if (!payload) {
            throw new CustomAPIError('Authentication invalid', 401)
        }

        const fieldAgent = await FieldAgent.findOne({ _id: payload.fieldAgentId })
        if (!fieldAgent) {
            throw new CustomAPIError('Authentication invalid', 401)
        }
        if (fieldAgent.authTokenExpiration < new Date()) {
            await User.findOneAndUpdate({ _id: payload.fieldAgentId },
                { authTokenExpiration: null },
                { new: true, runValidators: true })
            return res.status(StatusCodes.OK).json({ status: 'session_expired', msg: 'Successfully logged out' })
        }
        req.fieldAgent = {
            fieldAgentId: payload.fieldAgentId,
            email: payload.email
        }
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = authenticateFieldAgent
