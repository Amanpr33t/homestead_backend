require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const CustomAPIError = require('../../errors/custom-error')
const emailValidator = require("email-validator")
const { uniqueIdGeneratorForPropertyDealer } = require('../../utils/uniqueIdGenerator')

//The function is used to add a property dealer
const addPropertyDealer = async (req, res, next) => {
    try {
        if (req.fieldAgent && req.fieldAgent._id) {
            req.body.addedByFieldAgent = req.fieldAgent._id //field agent ID is added to the request body
        }

        const {
            email
        } = req.body

        //The if statements below are used to verify the request body data
        if (!emailValidator.validate(email)) {
            throw new CustomAPIError('Email not valid', 204)
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

        const propertyDealer = await PropertyDealer.findOne({ email })
        const authToken = await propertyDealer.createJWT()

        res.status(StatusCodes.OK).json({ status: 'ok', message: 'property dealer has been successfully added', authToken })
        return
    } catch (error) {
        console.log(error)
        next(error)
    }
}

//The function is used to check if the another property dealer with same email exists
const propertyDealerEmailExists = async (req, res, next) => {
    try {
        const { email } = req.query
        if (!email) {
            throw new CustomAPIError('Email not provided', StatusCodes.BAD_REQUEST)
        }
        const propertyDealerEmailExists = await PropertyDealer.findOne({ email })
        if (propertyDealerEmailExists) {
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
const propertyDealerContactNumberExists = async (req, res, next) => {
    try {
        const { contactNumber } = req.query
        if (!contactNumber) {
            throw new CustomAPIError('contact not provided', StatusCodes.BAD_REQUEST)
        }
        const propertyDealerContactNumberExists = await PropertyDealer.findOne({ contactNumber })
        if (propertyDealerContactNumberExists) {
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

//The function is used to check if the another property dealer with same gst number exists
const propertyDealerGstNumberExists = async (req, res, next) => {
    try {
        const { gstNumber } = req.query
        if (!gstNumber) {
            throw new CustomAPIError('gst number not provided', StatusCodes.BAD_REQUEST)
        }
        const propertyDealerGstNumberExists = await PropertyDealer.findOne({ gstNumber })
        if (propertyDealerGstNumberExists) {
            res.status(StatusCodes.OK).json({
                status: 'gstNumberExists',
                message: 'GST number already exist'
            })
            return
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
        if (!reraNumber) {
            throw new CustomAPIError('RERA number not provided', StatusCodes.BAD_REQUEST)
        }
        const propertyDealerReraNumberExists = await PropertyDealer.findOne({ reraNumber })
        if (propertyDealerReraNumberExists) {
            res.status(StatusCodes.OK).json({
                status: 'reraNumberExists',
                message: 'RERA number already exist'
            })
            return
        }
        res.status(StatusCodes.OK).json({
            status: 'ok',
            message: 'Valid RERA number'
        })
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