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
        const agriculturalPropertiesAdded = await AgriculturalProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id
        })
        const residentialPropertiesAdded = await ResidentialProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id
        })
        const commercialPropertiesAdded = await CommercialProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id
        })

        const numberOfPropertyDealersAdded = await PropertyDealer.countDocuments({
            addedByFieldAgent: req.fieldAgent._id
        })

        const agriculturalPropertiesPendingForReevaluation = await AgriculturalProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            'sentBackTofieldAgentForReevaluationByEvaluator.isSent': true
        })
        const residentialPropertiesPendingForReevaluation = await ResidentialProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            'sentBackTofieldAgentForReevaluationByEvaluator.isSent': true
        })
        const commercialPropertiesPendingForReevaluation = await CommercialProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            'sentBackTofieldAgentForReevaluationByEvaluator.isSent': true
        })

        res.status(StatusCodes.OK).json({
            status: 'ok',
            numberOfPropertyDealersAdded,
            numberOfPropertiesAdded: {
                agricultural: agriculturalPropertiesAdded,
                residential: residentialPropertiesAdded,
                commercial: commercialPropertiesAdded
            },
            pendingPropertyReevaluations: {
                agricultural: agriculturalPropertiesPendingForReevaluation,
                residential: residentialPropertiesPendingForReevaluation,
                commercial: commercialPropertiesPendingForReevaluation
            }
        })
        return
    } catch (error) {
        console.log(data)
        next(error)
    }
}

module.exports = {
    dataForFieldAgentHomePage
}