require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const CommercialProperty = require('../../models/commercialProperty')
const ResidentialProperty = require('../../models/residentialProperty')
const CustomAPIError = require('../../errors/custom-error')

//To get details about a property
const getProperty = async (req, res, next) => {
    try {
        const { id, type } = req.query
        if (!id) {
            throw new CustomAPIError('property id not provided', StatusCodes.BAD_REQUEST)
        }
        let propertyData
        if (type === 'agricultural') {
            propertyData = await AgriculturalProperty.findOne({ _id: id })
        } else if (type === 'residential') {
            propertyData = await ResidentialProperty.findOne({ _id: id })
        } else if (type === 'commercial') {
            propertyData = await CommercialProperty.findOne({ _id: id })
        } else {
            throw new CustomAPIError('property type not provided', StatusCodes.BAD_REQUEST)
        }

        res.status(StatusCodes.OK).json({ status: 'ok', propertyData })
        return
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getProperty
}