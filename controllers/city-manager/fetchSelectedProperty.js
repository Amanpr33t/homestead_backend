require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Property = require('../../models/property')
const CustomAPIError = require('../../errors/custom-error')

//fetch details of a selected property
const fetchSelectedProperty = async (req, res, next) => {
    try {
        const { propertyId } = req.query
        if (!propertyId) {
            throw new CustomAPIError('property id not provided', 204)
        }
        let property = await Property.findOne({ _id: propertyId })

        return res.status(StatusCodes.OK).json({ status: 'ok', property })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    fetchSelectedProperty
}