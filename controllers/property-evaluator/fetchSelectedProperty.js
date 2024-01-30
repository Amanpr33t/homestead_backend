require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CommercialProperty = require('../../models/commercialProperty')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const ResidentialProperty = require('../../models/residentialProperty')
const CustomAPIError = require('../../errors/custom-error')

//fetch details of a selected property
const fetchSelectedProperty = async (req, res, next) => {
    try {
        const { propertyType, propertyId } = req.query
        if(!propertyId){
            throw new CustomAPIError('property id not provided',204)
        }
        let property
        if (propertyType === 'residential') {
            property = await ResidentialProperty.findOne({ _id: propertyId })
        } else if (propertyType === 'commercial') {
            property = await CommercialProperty.findOne({ _id: propertyId })
        } else if (propertyType === 'agricultural') {
            property = await AgriculturalProperty.findOne({ _id: propertyId })
        }else{
            throw new CustomAPIError('property type not provided',204)
        }

        return res.status(StatusCodes.OK).json({ status: 'ok', property })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    fetchSelectedProperty
}