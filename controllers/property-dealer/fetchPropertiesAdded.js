require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const CommercialProperty = require('../../models/commercialProperty')
const ResidentialProperty = require('../../models/residentialProperty')

//The function is used to fetch properties added by a property dealer
const fetchPropertiesAdded = async (req, res, next) => {
    try {
        const {
            propertyType,
            state,
            year,
            status
        } = req.query

        let filterData = {}
        if (propertyType) {
            filterData.propertyType = propertyType.toLowerCase()
        }
        if (state) {
            filterData = {
                ...filterData,
                'location.name.state': state
            }
        }
        if (year) {
            // Calculate start and end dates of the year
            const startDate = new Date(year, 0, 1) // January 1st of the year
            const endDate = new Date(year, 11, 31, 23, 59, 59, 999) // December 31st of the year

            // Add createdAt filter based on date range
            filterData.createdAt = {
                $gte: startDate,
                $lte: endDate
            }
        }
        if (status) {
            filterData.status = status
        }

        let agriculturalProperties = []
        let commercialProperties = []
        let residentialProperties = []

        agriculturalProperties = await AgriculturalProperty.find({
            addedByPropertyDealer: req.propertyDealer._id,
            ...filterData
        }).select('location propertyType status createdAt')

        commercialProperties = await CommercialProperty.find({
            addedByPropertyDealer: req.propertyDealer._id,
            ...filterData
        }).select('location propertyType status createdAt')

        residentialProperties = await ResidentialProperty.find({
            addedByPropertyDealer: req.propertyDealer._id,
            ...filterData
        }).select('location propertyType status createdAt')

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            properties: [
                ...agriculturalProperties,
                ...residentialProperties,
                ...commercialProperties
            ]
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    fetchPropertiesAdded
}

