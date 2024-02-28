require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CustomAPIError = require('../../errors/custom-error')
const Property = require('../../models/property')

//The function is used fetch property details
const getPropertyDetails = async (req, res, next) => {
    try {
        const {
            type,
            id
        } = req.query
        if (!id) {
            throw new CustomAPIError('proeprty id not provided', 204)
        }

        let property = await Property.findOne({ _id: id })

        if (property && property.addedByPropertyDealer.toString() !== req.propertyDealer._id.toString()) {
            throw new CustomAPIError('Property dealer who requested details and property dealer who added proeprty are not same', StatusCodes.UNAUTHORIZED)
        }

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            property
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getPropertyDetails
}