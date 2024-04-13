require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Customer = require('../../models/customer')

//To update property data after reevaluation
const editCustomerDetails = async (req, res, next) => {
    try {
        await Customer.findOneAndUpdate({ _id: req.customer._id },
            req.body,
            { new: true, runValidators: true })

        res.status(StatusCodes.OK).json({ status: 'ok' })
        return
    } catch (error) {
        next(error)
    }
}

module.exports = { editCustomerDetails }