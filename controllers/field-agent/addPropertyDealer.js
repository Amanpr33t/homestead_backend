require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const FieldAgent = require('../../models/fieldAgent')
const PropertyDealer=require('../../models/propertyDealer')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const CustomAPIError = require('../../errors/custom-error')
const origin = process.env.ORIGIN

const addPropertyDealer = async (req, res, next) => {
    try {
        req.body.addedByFieldAgent = req.fieldAgent.fieldAgentId
        const { firmName, propertyDealerName, image, about, experience, languages, dealsIn, areaOfOperation, officeAddress,  gstNumber } = req.body

        await PropertyDealer.create(req.body)
        return res.status(StatusCodes.OK).json({ status: 'ok', message:'property dealer has been successfully added' })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    addPropertyDealer
}