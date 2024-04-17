require('express-async-errors')
const CityManager = require('../models/cityManager')
const jwt = require('jsonwebtoken')
const CustomAPIError = require('../errors/custom-error')
require('dotenv').config()
const { StatusCodes } = require('http-status-codes')

//This function is used to authenticate a field agent. The field agent is authenticated using a authentication token
const authenticateCityManager = async (req, res, next) => {
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

        const cityManager = await CityManager.findOne({ _id: payload.cityManagerId })
        if (!cityManager) {
            return res.status(StatusCodes.OK).json({ status: 'invalid_authentication' })
        }
        /*if (cityManager.authTokenExpiration < new Date()) {
            await CityManager.findOneAndUpdate({ _id: payload.cityManagerId },
                { authTokenExpiration: null },
                { new: true, runValidators: true })
            return res.status(StatusCodes.OK).json({ status: 'invalid_authentication' })
        }*/
        req.cityManager = cityManager
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = authenticateCityManager
