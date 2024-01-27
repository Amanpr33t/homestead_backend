require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CommercialProperty = require('../../models/commercialProperty')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const ResidentialProperty = require('../../models/residentialProperty')

/*The function is used to send to the user the following data:
1) Number of properties successfully evaluated by the evaluator
2) Number of properties sent to the for reconsideration to the field agent by the evaluator
3) Number of pending property evaluations
*/
const propertyEvaluationData = async (req, res, next) => {
    try {
        const agriculturalPropertiesSuccessfullyEvaluated = await AgriculturalProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            isEvaluatedSuccessfully: true
        })
        const commercialPropertiesSuccessfullyEvaluated = await CommercialProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            isEvaluatedSuccessfully: true
        })
        const residentialPropertiesSuccessfullyEvaluated = await ResidentialProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            isEvaluatedSuccessfully: true
        })
        const propertiesSuccessfullyEvaluated = agriculturalPropertiesSuccessfullyEvaluated + residentialPropertiesSuccessfullyEvaluated + commercialPropertiesSuccessfullyEvaluated


        const agriculturalPropertiesSentToFieldAgentForReconsideration = await AgriculturalProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            sentBackTofieldAgentForReevaluation: true
        })
        const commercialPropertiesSentToFieldAgentForReconsideration = await CommercialProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            sentBackTofieldAgentForReevaluation: true
        })
        const residentialPropertiesSentToFieldAgentForReconsideration = await ResidentialProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            sentBackTofieldAgentForReevaluation: true
        })
        const propertiesSentToFieldAgentForReconsideration = residentialPropertiesSentToFieldAgentForReconsideration + agriculturalPropertiesSentToFieldAgentForReconsideration + commercialPropertiesSentToFieldAgentForReconsideration


        const agriculturalPropertiesPendingForEvaluation = await AgriculturalProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            isSentForEvaluation: true
        })
        const commercialPropertiesPendingForEvaluation = await CommercialProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            isSentForEvaluation: true
        })
        const residentialPropertiesPendingForEvaluation = await ResidentialProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            isSentForEvaluation: true
        })
        const pendingPropertyEvaluations = residentialPropertiesPendingForEvaluation + agriculturalPropertiesPendingForEvaluation + commercialPropertiesPendingForEvaluation

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            propertiesSuccessfullyEvaluated, propertiesSentToFieldAgentForReconsideration,
            pendingPropertyEvaluations
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    propertyEvaluationData
}