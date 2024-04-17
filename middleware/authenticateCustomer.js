require('express-async-errors')
const Customer = require('../models/customer')
const jwt = require('jsonwebtoken')
const CustomAPIError = require('../errors/custom-error')
require('dotenv').config()
const { StatusCodes } = require('http-status-codes')

//This function is used to authenticate a property dealer. The property dealer is authenticated using a authentication token
const authenticateCustomer = async (req, res, next) => {
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

        const customer = await Customer.findOne({ _id: payload.customerId })
        if (!customer) {
            return res.status(StatusCodes.OK).json({ status: 'invalid_authentication' })
        }
        /*if (customer.authTokenExpiration < new Date()) {
            await Customer.findOneAndUpdate({ _id: payload.dealerId },
                { authTokenExpiration: null },
                { new: true, runValidators: true })
            return res.status(StatusCodes.OK).json({ status: 'invalid_authentication' })
        }*/
        req.customer = customer
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = authenticateCustomer
