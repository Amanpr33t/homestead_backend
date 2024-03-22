require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const CustomAPIError = require('../../errors/custom-error')

//The function is used to fetch properties added by a property dealer
const deleteCustomerRequest = async (req, res, next) => {
    try {
        const { propertyId, customerId } = req.query

        if (!propertyId || !customerId) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        let updatedCustomerRequests = []
        req.propertyDealer.requestsFromCustomer && req.propertyDealer.requestsFromCustomer.length > 0 && req.propertyDealer.requestsFromCustomer.forEach(request => {
            if (request.propertyId === propertyId && request.customerId === customerId) {
                return
            }
            updatedCustomerRequests = [
                ...updatedCustomerRequests,
                request
            ]
        })

        await PropertyDealer.findOneAndUpdate(
            { _id: req.propertyDealer._id },
            { requestsFromCustomer: updatedCustomerRequests },
            { new: true }
        )

        const customerRequests = await PropertyDealer.aggregate([
            { $match: { _id: req.propertyDealer._id } },
            { $unwind: "$requestsFromCustomer" }, // Unwind the array
            { $sort: { "requestsFromCustomer.date": -1 } }, // Sort based on the date field
            { $group: { _id: "$_id", requestsFromCustomer: { $push: "$requestsFromCustomer" } } }, // Group back the array
            { $project: { _id: 0, requestsFromCustomer: 1 } } // Project only the requestsFromCustomer field
        ]);

        res.status(StatusCodes.OK).json({
            status: 'ok',
            customerRequests: customerRequests && customerRequests.length > 0 ? customerRequests[0].requestsFromCustomer : []
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = {
    deleteCustomerRequest
}

