require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const CustomAPIError = require('../../errors/custom-error')
const emailValidator = require("email-validator")
const { uniqueIdGeneratorForPropertyDealer } = require('../../utils/uniqueIdGenerator')

//The function is used to update property dealer details
const updatePropertyDealerDetails = async (req, res, next) => {
    try {
        const {
            addressArray,
            about
        } = req.body
        //The if statements below are used to verify the request body data
        addressArray.forEach(address => {
            const { postalCode } = address
            if (postalCode && postalCode.toString().length !== 6) {
                throw new CustomAPIError('Postal code should be a 6 digit number', 204)
            }
        })
        if (!addressArray.length || (about && about.trim().length > 400)) {
            throw new CustomAPIError('Incorrect data', 204)
        }

        await PropertyDealer.findOneAndUpdate({ _id: req.propertyDealer._id },
            { ...req.body },
            { new: true, runValidators: true })

        return res.status(StatusCodes.OK).json({ status: 'ok', message: 'Property dealer has been successfully updated' })
    } catch (error) {
        console.log(error)
        next(error)
    }
}


module.exports = {
    updatePropertyDealerDetails
}