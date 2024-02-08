require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CommercialProperty = require('../../models/commercialProperty')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const ResidentialProperty = require('../../models/residentialProperty')

const numberOfPropertiesPendingForApproval = async (req, res, next) => {
    try {
        const agriculturalPropertiesPendingForApproval = await AgriculturalProperty.countDocuments({
            cityManager: req.cityManager._id,
            'sentToCityManagerForApproval.isSent': true
        })

        const commercialPropertiesPendingForApproval = await CommercialProperty.countDocuments({
            cityManager: req.cityManager._id,
            'sentToCityManagerForApproval.isSent': true
        })
        const residentialPropertiesPendingForApproval = await ResidentialProperty.countDocuments({
            cityManager: req.cityManager._id,
            'sentToCityManagerForApproval.isSent': true
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