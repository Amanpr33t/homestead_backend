require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const Property = require('../../models/property')
const Customer = require('../../models/customer')

//The function is used to update 'unseen' status of a customer request to 'seen'
const updateSeenStatusOfCustomerRequest = async (req, res, next) => {
    try {
        const { customerId, propertyId, requestSeen } = req.query

        if (requestSeen === false) {
            //to be done
            await PropertyDealer.findOneAndUpdate(
                {
                    _id: req.propertyDealer._id,
                    'requestsFromCustomer.$.customerId': customerId,
                    'requestsFromCustomer.$.propertyId': propertyId
                },
                { $set: { 'requestsFromCustomer.$.requestSeen': false } },
                { new: true })
        }

        const customerOfRequest = await Customer.findOne({ _id: customerId }).select('email contactNumber name')

        let customerRequests
        if (requestSeen === false) {
            customerRequests = await PropertyDealer.findOne({ _id: req.propertyDealer._id }).select('requestsFromCustomer')
        }

        const property = await Property.findOne({ _id: propertyId })

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            customerRequests: customerRequests ? customerRequests.requestsFromCustomer : null,
            property,
            customerInformation: {
                name: customerOfRequest.name,
                email: customerOfRequest.email,
                contactNumber: customerOfRequest.contactNumber
            }
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = {
    updateSeenStatusOfCustomerRequest
}