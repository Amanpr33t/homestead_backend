require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const FieldAgent = require('../../models/fieldAgent')
const PropertyDealer = require('../../models/propertyDealer')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const CustomAPIError = require('../../errors/custom-error')
const origin = process.env.ORIGIN
const emailValidator = require("email-validator");

const addPropertyDealer = async (req, res, next) => {
    try {
        req.body.addedByFieldAgent = req.fieldAgent._id
        const {
            firmName,
            propertyDealerName,
            propertyType,
            addressArray,
            gstNumber,
            about,
            firmLogoUrl,
            email,
            contactNumber
        } = req.body

        if (!firmName.trim() || !propertyDealerName.trim() || propertyType.length === 0 || !addressArray.length || !gstNumber.trim() || !contactNumber.trim() || !email.trim() || !emailValidator.validate(email.trim()) || about.trim().split(/\s+/) > 150 || !firmLogoUrl) {
            throw new CustomAPIError('Insufficient data', 204)
        }

        const propertyDealerGstNumberExists = await PropertyDealer.findOne({ gstNumber: req.body.gstNumber })
        const propertyDealerEmailExists = await PropertyDealer.findOne({ email: req.body.email })
        const propertyDealerContactNumberExists = await PropertyDealer.findOne({ contactNumber: req.body.contactNumber })

        if (propertyDealerEmailExists || propertyDealerContactNumberExists || propertyDealerGstNumberExists) {
            throw new CustomAPIError('Another property dealer with the same email, gst number or contact number already exists', 204)
        }

        const newPropertyDealer = await PropertyDealer.create(req.body)

        const propertyDealersAddedByFieldAgent =req.fieldAgent.propertyDealersAdded
        console.log(req.fieldAgent)
        const updatePropertyDealersAddedByFieldAgent = newPropertyDealer && [...propertyDealersAddedByFieldAgent, newPropertyDealer._id]
        console.log(updatePropertyDealersAddedByFieldAgent)

        await FieldAgent.findOneAndUpdate({ _id: req.fieldAgent._id },
            { propertyDealersAdded: updatePropertyDealersAddedByFieldAgent },
            { new: true, runValidators: true })
        return res.status(StatusCodes.OK).json({ status: 'ok', message: 'property dealer has been successfully added' })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

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

module.exports = {
    addPropertyDealer, propertyDealerContactNumberExists, propertyDealerEmailExists, propertyDealerGstNumberExists
}