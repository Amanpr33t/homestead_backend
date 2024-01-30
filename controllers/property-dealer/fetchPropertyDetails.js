require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CustomAPIError = require('../../errors/custom-error')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const CommercialProperty = require('../../models/commercialProperty')
const ResidentialProperty = require('../../models/residentialProperty')

//The function is used fetch property details
const getPropertyDetails = async (req, res, next) => {
    try {
        const {
            type,
            id
        } = req.query
        if(!id){
            throw new CustomAPIError('proeprty id not provided', 204)
        }

        let property = null

        if (type === 'agricultural') {
            property = await AgriculturalProperty.findOne({ _id: id })
        } else if (type === 'commercial') {
            property = await CommercialProperty.findOne({ _id: id })
        } else if (type === 'residential') {
            property = await ResidentialProperty.findOne({ _id: id })
        }else{
            throw new CustomAPIError('proeprty type not provided', 204)
        }

        if (property && property.addedByPropertyDealer.toString() !== req.propertyDealer._id.toString()) {
            throw new CustomAPIError('Property dealer who requested details and property dealer who added proeprty are not same', StatusCodes.UNAUTHORIZED)
        }

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            property
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getPropertyDetails
}