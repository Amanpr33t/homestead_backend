require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const CustomAPIError = require('../../errors/custom-error')

//The function is used to fetch dealer details
const getDealerDetails = async (req, res, next) => {
    try {
        return res.status(StatusCodes.OK).json({
             status: 'ok',
              details: req.propertyDealer 
            })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getDealerDetails
}