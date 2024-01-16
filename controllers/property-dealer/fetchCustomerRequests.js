require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const { getDaysDifference } = require('../../utils/getDaysDifference')

//The function is used to add a property dealer
const fetchCustomerRequests = async (req, res, next) => {
    try {
        const filteredCustomerRequests = req.propertyDealer.requestsFromCustomer.filter(request => getDaysDifference(request.requestDate) < 30)
        await PropertyDealer.findOneAndUpdate({ _id: req.propertyDealer._id },
            {
                requestsFromCustomer: filteredCustomerRequests
            },
            { new: true, runValidators: true })

        return res.status(StatusCodes.OK).json({ status: 'ok', customerRequests: filteredCustomerRequests })
    } catch (error) {
        next(error)
    }
}

const fetchNumberOfCustomerRequests = async (req, res, next) => {
    try {
        const filteredCustomerRequests = req.propertyDealer.requestsFromCustomer.filter(request => request.requestSeen === false)
        return res.status(StatusCodes.OK).json({ status: 'ok', numberOfCustomerRequests: filteredCustomerRequests.length })
    } catch (error) {
        next(error)
    }
}
module.exports = {
    fetchCustomerRequests,
    fetchNumberOfCustomerRequests
}