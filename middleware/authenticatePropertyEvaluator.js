require('express-async-errors')
const PropertyEvaluator = require('../models/propertyEvaluator')
const jwt = require('jsonwebtoken')
const CustomAPIError = require('../errors/custom-error')
require('dotenv').config()
const { StatusCodes } = require('http-status-codes')

//This function is used to authenticate a property evaluator. The property evaluator is authenticated using a authentication token
const authenticatePropertyEvaluator = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return res.status(StatusCodes.OK).json({ status: 'invalid_authentication' })
        }
        const token = authHeader.split(' ')[1]

        const payload = jwt.verify(token, process.env.JWT_SECRET)

        if (!payload) {
            return res.status(StatusCodes.OK).json({ status: 'invalid_authentication' })
        }

        const propertyEvaluator = await PropertyEvaluator.findOne({ _id: payload.propertyEvaluatorId })
        if (!propertyEvaluator) {
            return res.status(StatusCodes.OK).json({ status: 'invalid_authentication' })
        }
        /*if (propertyEvaluator.authTokenExpiration < new Date()) {
            await PropertyEvaluator.findOneAndUpdate({ _id: payload.propertyEvaluatorId },
                { authTokenExpiration: null },
                { new: true, runValidators: true })
            return res.status(StatusCodes.OK).json({ status: 'invalid_authentication' })
        }*/
        req.propertyEvaluator = propertyEvaluator
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = authenticatePropertyEvaluator
