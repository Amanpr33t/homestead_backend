require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Customer = require('../../models/customer')
const CustomAPIError = require('../../errors/custom-error')

const fetchCustomerDetails = async (req, res, next) => {
    try {
        const customerId = req.customer._id

        let customer = await Customer.findOne({ _id: customerId }).select('name district state email contactNumber')

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            name: customer.name,
            email: customer.email,
            contactNumber: customer.contactNumber,
            state: customer.state,
            district: customer.district
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    fetchCustomerDetails
}