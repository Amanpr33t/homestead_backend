require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const Property = require('../../models/property')
const Customer = require('../../models/customer')

//The function is used to update 'unseen' status of a customer request to 'seen'
const updateSeenStatusOfCustomerRequest = async (req, res, next) => {
    try {
        const { customerId, propertyId } = req.query
        const { requestSeen } = req.body
        console.log(customerId, propertyId, requestSeen)

        let customerRequests
        let updatedCustomerRequests = []
        if (requestSeen === false) {
            req.propertyDealer.requestsFromCustomer && req.propertyDealer.requestsFromCustomer.length > 0 && req.propertyDealer.requestsFromCustomer.forEach(request => {
                if (request.propertyId === propertyId && request.customerId === customerId && request.requestSeen === false) {
                    updatedCustomerRequests = [
                        ...updatedCustomerRequests,
                        {
                            propertyId: request.propertyId,
                            customerId: request.customerId,
                            customerName: request.customerName,
                            date: request.date,
                            requestSeen: true
                        }
                    ]
                } else {
                    updatedCustomerRequests = [
                        ...updatedCustomerRequests,
                        request
                    ]
                }
            })

            await PropertyDealer.findOneAndUpdate(
                { _id: req.propertyDealer._id },
                { requestsFromCustomer: updatedCustomerRequests },
                { new: true }
            )

            customerRequests = await PropertyDealer.aggregate([
                { $match: { _id: req.propertyDealer._id } },
                { $unwind: "$requestsFromCustomer" }, // Unwind the array
                { $sort: { "requestsFromCustomer.date": -1 } }, // Sort based on the date field
                { $group: { _id: "$_id", requestsFromCustomer: { $push: "$requestsFromCustomer" } } }, // Group back the array
                { $project: { _id: 0, requestsFromCustomer: 1 } } // Project only the requestsFromCustomer field
            ]);
        }

        const customerOfRequest = await Customer.findOne({ _id: customerId }).select('email contactNumber name')

        const property = await Property.findOne({ _id: propertyId })

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            customerRequests: customerRequests ? customerRequests[0].requestsFromCustomer : null,
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