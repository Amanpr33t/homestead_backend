require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const CommercialProperty = require('../../models/commercialProperty')
const ResidentialProperty = require('../../models/residentialProperty')
const CustomAPIError = require('../../errors/custom-error')

////The function provides the number of proeprties and property dealers added by the field agent
const dataForFieldAgentHomePage = async (req, res, next) => {
    try {
        const agriculturalPropertiesApprovedByCityManager = await AgriculturalProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            'isApprovedByCityManager.isApproved': true
        })
        const commercialPropertiesApprovedByCityManager = await CommercialProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            'isApprovedByCityManager.isApproved': true
        })
        const residentialPropertiesApprovedByCityManager = await ResidentialProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            'isApprovedByCityManager.isApproved': true
        })
        const numberOfPropertiesApprovedByCityManager = agriculturalPropertiesApprovedByCityManager + commercialPropertiesApprovedByCityManager + residentialPropertiesApprovedByCityManager

        const agriculturalPropertiesAdded = await AgriculturalProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id
        })
        const residentialPropertiesAdded = await ResidentialProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id
        })
        const commercialPropertiesAdded = await CommercialProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id
        })
        const numberOfPropertiesAdded = agriculturalPropertiesAdded + residentialPropertiesAdded + commercialPropertiesAdded

        const numberOfPropertyDealersAdded = await PropertyDealer.countDocuments({
            addedByFieldAgent: req.fieldAgent._id
        })

        const agriculturalPropertiesPendingForReevaluation = await AgriculturalProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            'sentBackTofieldAgentForReevaluation.isSent': true
        })
        const residentialPropertiesPendingForReevaluation = await ResidentialProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            'sentBackTofieldAgentForReevaluation.isSent': true
        })
        const commercialPropertiesPendingForReevaluation = await CommercialProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            'sentBackTofieldAgentForReevaluation.isSent': true
        })
        const pendingPropertyReevaluations={
            agricultural: agriculturalPropertiesPendingForReevaluation,
            residential: residentialPropertiesPendingForReevaluation,
            commercial: commercialPropertiesPendingForReevaluation
        }

        res.status(StatusCodes.OK).json({
            status: 'ok',
            numberOfPropertiesApprovedByCityManager,
            numberOfPropertiesAdded,
            numberOfPropertyDealersAdded,
            pendingPropertyReevaluations
        })
        return
    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = {
    dataForFieldAgentHomePage
}