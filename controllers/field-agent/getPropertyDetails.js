require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Property = require('../../models/property')
const PropertyDealer=require('../../models/propertyDealer')
const CustomAPIError = require('../../errors/custom-error')

//To get details about a property
const getProperty = async (req, res, next) => {
    try {
        const { id, type, dealerInfo } = req.query
        if (!id) {
            throw new CustomAPIError('property id not provided', StatusCodes.BAD_REQUEST)
        }

        const propertyData = await Property.findOne({ _id: id })

        let dealer

        if (dealerInfo && propertyData) {
            console.log(propertyData.addedByPropertyDealer)
            dealer = await PropertyDealer.findOne({ _id: propertyData.addedByPropertyDealer }).select('propertyDealerName  firmName email contactNumber')
            console.log(dealer)
        }

        res.status(StatusCodes.OK).json({ status: 'ok', propertyData, dealerInfo: dealer })
        return
    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = {
    getProperty
}