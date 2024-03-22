require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const FieldAgent = require('../../models/fieldAgent')
const PropertyDealer = require('../../models/propertyDealer')
const CustomAPIError = require('../../errors/custom-error')

//To update property data after reevaluation
const requestsToAddNewProperty = async (req, res, next) => {
    try {
        const requests = await FieldAgent.findOne({
            addedByFieldAgent: req.fieldAgent._id
        }).select('requestsToAddProperty')

        res.status(StatusCodes.OK).json({ status: 'ok', requests: requests.requestsToAddProperty })
    } catch (error) {
        next(error)
    }
}

//yes
const dealerDetailsForAddProperty = async (req, res, next) => {
    try {
        const { dealerId } = req.query

        const dealerInfo = await PropertyDealer.findOne({
            addedByPropertyDealer: dealerId
        }).select('propertyDealerName firmName contactNumber email')

        res.status(StatusCodes.OK).json({ status: 'ok', dealerInfo })
    } catch (error) {
        next(error)
    }
}

module.exports = { requestsToAddNewProperty,dealerDetailsForAddProperty }