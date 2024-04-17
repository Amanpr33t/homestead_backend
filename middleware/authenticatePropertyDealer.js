require('express-async-errors')
const PropertyDealer = require('../models/propertyDealer')
const jwt = require('jsonwebtoken')
const CustomAPIError = require('../errors/custom-error')
require('dotenv').config()
const { StatusCodes } = require('http-status-codes')

//This function is used to authenticate a property dealer. The property dealer is authenticated using a authentication token
const authenticatePropertyDealer = async (req, res, next) => {
    try {
        console.log('auth')
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer')) {
            console.log(1)
            return res.status(StatusCodes.OK).json({ status: 'invalid_authentication' })
        }
        const token = authHeader.split(' ')[1]

        const payload = jwt.verify(token, process.env.JWT_SECRET)
        if (!payload) {
            console.log(2)
            return res.status(StatusCodes.OK).json({ status: 'invalid_authentication' })
        }

        const propertyDealer = await PropertyDealer.findOne({ _id: payload.dealerId })
        if (!propertyDealer) {
            console.log(3)
            return res.status(StatusCodes.OK).json({ status: 'invalid_authentication' })
        }
        /*if (propertyDealer.authTokenExpiration < new Date()) {
            await PropertyDealer.findOneAndUpdate({ _id: payload.dealerId },
                { authTokenExpiration: null },
                { new: true, runValidators: true })
            return res.status(StatusCodes.OK).json({ status: 'invalid_authentication' })
        }*/
        req.propertyDealer = propertyDealer
        next()
    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = authenticatePropertyDealer
