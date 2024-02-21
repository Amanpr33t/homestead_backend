require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const { getDaysDifference } = require('../../utils/getDaysDifference')
const customer = require('../../models/customer')

//The function is used to update 'unseen' status of a customer request to 'seen
const updateSeenStatusOfCustomerRequest = async (req, res, next) => {
    try {
        const { customerId, propertyId } = req.query

        await PropertyDealer.findOneAndUpdate(
            {
                _id: req.propertyDealer._id,
                'requestsFromCustomer.customerId': customerId,
                'requestsFromCustomer.propertyId': propertyId
            },
            { $set: { 'requestsFromCustomer.$.requestSeen': true } },
            { new: true })

        const customerRequests = await PropertyDealer.findOne({ _id: req.propertyDealer._id }).select('requestsFromCustomer')

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            customerRequests:customerRequests.requestsFromCustomer
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    updateSeenStatusOfCustomerRequest
}