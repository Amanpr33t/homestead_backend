require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const CustomAPIError = require('../../errors/custom-error')
const emailValidator = require("email-validator")
const { uniqueIdGeneratorForPropertyDealer } = require('../../utils/uniqueIdGenerator')

//The function is used to add a property dealer
const addPropertyDealer = async (req, res, next) => {
    try {
        // req.body.addedByFieldAgent = req.fieldAgent._id //field agent ID is added to the request body
        const {
            addressArray,
            about,
            email
        } = req.body

        //The if statements below are used to verify the request body data
        addressArray.forEach(address => {
            const { postalCode } = address
            if (postalCode && postalCode.toString().length !== 6) {
                throw new CustomAPIError('Postal code should be a 6 digit number', 204)
            }
        })
        if (!addressArray.length || !emailValidator.validate(email.trim()) || about.trim().length > 400) {
            throw new CustomAPIError('Incorrect data', 204)
        }

        const propertyDealerGstNumberExists = await PropertyDealer.findOne({ gstNumber: req.body.gstNumber }) //Checks whether another property dealer with same gst number exists
        const propertyDealerReraNumberExists = await PropertyDealer.findOne({ reraNumber: req.body.reraNumber }) //Checks whether another property dealer with same RERA number exists
        const propertyDealerEmailExists = await PropertyDealer.findOne({ email: req.body.email }) //Checks whether another property dealer with same email exists
        const propertyDealerContactNumberExists = await PropertyDealer.findOne({ contactNumber: req.body.contactNumber }) //Checks whether another property dealer with same contact number exists

        if (propertyDealerEmailExists || propertyDealerContactNumberExists || propertyDealerGstNumberExists || propertyDealerReraNumberExists) {
            throw new CustomAPIError('Another property dealer with the same email, gst number, RERA number or contact number already exists', 204)
        }

        const uniqueId = await uniqueIdGeneratorForPropertyDealer() //generates a unique ID for the proeprty dealer
        await PropertyDealer.create({ ...req.body, uniqueId }) //Creates a new proeprty dealer in the database

        return res.status(StatusCodes.OK).json({ status: 'ok', message: 'Property dealer has been successfully added' })
    } catch (error) {
        next(error)
    }
}

//The function is used to check if the another property dealer with same email exists
const propertyDealerEmailExists = async (req, res, next) => {
    try {
        const { email } = req.query
        const propertyDealerEmailExists = await PropertyDealer.findOne({ email })
        if (propertyDealerEmailExists) {
            return res.status(StatusCodes.OK).json({ status: 'emailExists', message: 'Email already exist' })
        }
        res.status(StatusCodes.OK).json({ status: 'ok', message: 'Valid email' })
    } catch (error) {
        next(error)
    }
}

//The function is used to check if the another property dealer with same contact number exists
const propertyDealerContactNumberExists = async (req, res, next) => {
    try {
        const { contactNumber } = req.query
        const propertyDealerContactNumberExists = await PropertyDealer.findOne({ contactNumber })
        if (propertyDealerContactNumberExists) {
            return res.status(StatusCodes.OK).json({ status: 'contactNumberExists', message: 'Contact number already exist' })
        }
        res.status(StatusCodes.OK).json({ status: 'ok', message: 'Valid contact number' })
    } catch (error) {
        next(error)
    }
}

//The function is used to check if the another property dealer with same gst number exists
const propertyDealerGstNumberExists = async (req, res, next) => {
    try {
        const { gstNumber } = req.query
        const propertyDealerGstNumberExists = await PropertyDealer.findOne({ gstNumber })
        if (propertyDealerGstNumberExists) {
            return res.status(StatusCodes.OK).json({ status: 'gstNumberExists', message: 'GST number already exist' })
        }
        res.status(StatusCodes.OK).json({ status: 'ok', message: 'Valid gst number' })
    } catch (error) {
        next(error)
    }
}

//The function is used to check if the another property dealer with same RERA number exists
const propertyDealerReraNumberExists = async (req, res, next) => {
    try {
        const { reraNumber } = req.query
        const propertyDealerReraNumberExists = await PropertyDealer.findOne({ reraNumber })
        if (propertyDealerReraNumberExists) {
            return res.status(StatusCodes.OK).json({ status: 'reraNumberExists', message: 'RERA number already exist' })
        }
        res.status(StatusCodes.OK).json({ status: 'ok', message: 'Valid RERA number' })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    addPropertyDealer,
    propertyDealerContactNumberExists,
    propertyDealerEmailExists,
    propertyDealerGstNumberExists,
    propertyDealerReraNumberExists
}