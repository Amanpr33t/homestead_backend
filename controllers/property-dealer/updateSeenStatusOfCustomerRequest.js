require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const { getDaysDifference } = require('../../utils/getDaysDifference')
const customer = require('../../models/customer')

//The function is used to update 'unseen' status of a customer request to 'seen
const updateSeenStatusOfCustomerRequest = async (req, res, next) => {
    try {
        const { customerId, propertyId } = req.query

        const customerRequests = req.propertyDealer.requestsFromCustomer

        for (let i = 0; i < customerRequests.length; i++) {
            if (customerRequests[i].customerId === customerId && customerRequests[i].propertyId === propertyId) {
                // Update the specific key with the new value
                customerRequests[i].requestSeen = true;
                break; // Stop the loop once the update is done
            }
        }

        await PropertyDealer.findOneAndUpdate({ _id: req.propertyDealer._id },
            {
                requestsFromCustomer: customerRequests
            },
            { new: true, runValidators: true })

        return res.status(StatusCodes.OK).json({ status: 'ok' })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    updateSeenStatusOfCustomerRequest
}