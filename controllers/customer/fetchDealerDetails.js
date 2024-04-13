require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Property = require('../../models/property')
const PropertyDealer = require('../../models/propertyDealer')
const CustomAPIError = require('../../errors/custom-error')

//fetch details of a selected property
const fetchDealerDetails = async (req, res, next) => {
    try {
        const { propertyId } = req.query
        if (!propertyId) {
            throw new CustomAPIError('property id not provided', 204)
        }
        let propertyDealerId = await Property.findOne({ _id: propertyId }).select('addedByPropertyDealer')

        const dealerInfo = await PropertyDealer.findOne({ _id: propertyDealerId.addedByPropertyDealer }).select('firmName firmLogoUrl propertyDealerName address email contactNumber _id email contactNumber propertyDealerName')

        return res.status(StatusCodes.OK).json({ status: 'ok', dealerInfo })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    fetchDealerDetails
}