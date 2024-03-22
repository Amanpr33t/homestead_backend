require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Customer = require('../../models/customer')

//The function is used to add a property dealer
const addCustomer = async (req, res, next) => {
    try {
        await Customer.create(req.body) 
        return res.status(StatusCodes.OK).json({ status: 'ok', message: 'Property user has been successfully added' })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    addCustomer
}