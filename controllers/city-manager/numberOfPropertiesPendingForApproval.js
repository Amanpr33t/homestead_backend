require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Property = require('../../models/property')

const numberOfPropertiesPendingForApproval = async (req, res, next) => {
    try {
        const agriculturalPropertiesPendingForApproval = await Property.countDocuments({
            cityManager: req.cityManager._id,
            'sentToCityManagerForApproval.isSent': true,
            propertyType: 'agricultural'
        })

        const commercialPropertiesPendingForApproval = await Property.countDocuments({
            cityManager: req.cityManager._id,
            'sentToCityManagerForApproval.isSent': true,
            propertyType: 'commercial'
        })
        const residentialPropertiesPendingForApproval = await Property.countDocuments({
            cityManager: req.cityManager._id,
            'sentToCityManagerForApproval.isSent': true,
            propertyType: 'residential'
        })
        const numberOfPropertiesPendingForApproval = {
            agricultural: agriculturalPropertiesPendingForApproval,
            residential: residentialPropertiesPendingForApproval,
            commercial: commercialPropertiesPendingForApproval
        }

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            numberOfPropertiesPendingForApproval
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    numberOfPropertiesPendingForApproval
}