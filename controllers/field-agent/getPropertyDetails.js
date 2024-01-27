require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const CommercialProperty = require('../../models/commercialProperty')
const ResidentialProperty = require('../../models/residentialProperty')

//To get details about a property
const getProperty = async (req, res, next) => {
    try {
        const { id, type } = req.query
        let propertyData
        if (type === 'agricultural') {
            propertyData = await AgriculturalProperty.findOne({ _id: id })
        } else if (type === 'residential') {
            propertyData = await ResidentialProperty.findOne({ _id: id })
        } else if (type === 'commercial') {
            propertyData = await CommercialProperty.findOne({ _id: id })
        }

        return res.status(StatusCodes.OK).json({ status: 'ok', propertyData })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getProperty
}