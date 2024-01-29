require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CommercialProperty = require('../../models/commercialProperty')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const ResidentialProperty = require('../../models/residentialProperty')
const CustomAPIError = require('../../errors/custom-error')

//Function to send a property for reevaluation by field agent
const reevaluationOfPropertyData = async (req, res, next) => {
    try {
        const { propertyType, propertyId } = req.query
        
        let selectedModel
        if (propertyType === 'residential') {
            selectedModel = ResidentialProperty
        } else if (propertyType === 'agricultural') {
            selectedModel = AgriculturalProperty
        } else if (propertyType === 'commercial') {
            selectedModel = CommercialProperty
        } else {
            throw new CustomAPIError('Model name not provided', StatusCodes.BAD_REQUEST)
        }

        await selectedModel.findOneAndUpdate({ _id: propertyId },
            {
                $inc: { "numberOfReevaluationsReceivedByFieldAgent.fromEvaluator": 1 },
                sentBackTofieldAgentForReevaluationByEvaluator: {
                    isSent: true,
                    date: new Date()
                },
                sentToEvaluatorByFieldAgentForEvaluation: {
                    isSent: false,
                    date: null
                },
                evaluationData: req.body
            },
            { new: true, runValidators: true })

        return res.status(StatusCodes.OK).json({ status: 'ok' })
    } catch (error) {
        next(error)
    }
}


module.exports = {
    reevaluationOfPropertyData
}