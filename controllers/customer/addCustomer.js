require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Customer = require('../../models/customer')
const CustomAPIError = require('../../errors/custom-error')

//The function is used to add a customer
const addCustomer = async (req, res, next) => {
    try {
        const {
            name,
            email,
            contactNumber,
            state,
            district,
            password
        } = req.body

        if (!state || !district || !name || !contactNumber || !email || !password) {
            throw new CustomAPIError('Insufficient data', 204)
        }

        const customerEmailExists = await Customer.findOne({ email: req.body.email }) //Checks whether another customer with same email exists
        const customerContactNumberExists = await Customer.findOne({ contactNumber: req.body.contactNumber }) //Checks whether another customer with same contact number exists

        if (customerEmailExists || customerContactNumberExists) {
            throw new CustomAPIError('Another property dealer with the same email, gst number, RERA number or contact number already exists', 204)
        }

        const customer = await Customer.create(req.body)

        const authToken = await customer.createJWT()

        res.status(StatusCodes.OK).json({ status: 'ok', message: 'Customer has been successfully added', authToken })
        return
    } catch (error) {
        next(error)
    }
}

//The function is used to check if the another property dealer with same email exists
const customerEmailExists = async (req, res, next) => {
    try {
        const { email } = req.query
        if (!email) {
            throw new CustomAPIError('Email not provided', StatusCodes.BAD_REQUEST)
        }
        const customerEmailExists = await Customer.findOne({ email })
        if (customerEmailExists) {
            res.status(StatusCodes.OK).json({
                status: 'emailExists',
                message: 'Email already exist'
            })
            return
        }
        res.status(StatusCodes.OK).json({
            status: 'ok',
            message: 'Valid email'
        })
        return
    } catch (error) {
        next(error)
    }
}

//The function is used to check if the another property dealer with same contact number exists
const customerContactNumberExists = async (req, res, next) => {
    try {
        const { contactNumber } = req.query
        if (!contactNumber) {
            throw new CustomAPIError('contact not provided', StatusCodes.BAD_REQUEST)
        }
        const customerContactNumberExists = await Customer.findOne({ contactNumber })
        if (customerContactNumberExists) {
            res.status(StatusCodes.OK).json({
                status: 'contactNumberExists',
                message: 'Contact number already exist'
            })
            return
        }
        res.status(StatusCodes.OK).json({
            status: 'ok',
            message: 'Valid contact number'
        })
        return
    } catch (error) {
        next(error)
    }
}

module.exports = {
    addCustomer,
    customerContactNumberExists,
    customerEmailExists
}