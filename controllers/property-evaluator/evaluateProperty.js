require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CommercialProperty = require('../../models/commercialProperty')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const ResidentialProperty = require('../../models/residentialProperty')

//Update a property on successful evaluation of data
const evaluateProperty = async (req, res, next) => {
    try {
        const {
            propertyType,
            propertyId,
            isInformationComplete
        } = req.query

        if (!propertyId) {
            throw new CustomAPIError('Insufficient data', 204)
        }

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

        if (isInformationComplete === 'true') {
            //evaluate data
            await selectedModel.findOneAndUpdate({ _id: propertyId },
                {
                    sentToEvaluatorByFieldAgentForEvaluation: {
                        isSent: false,
                        date: null
                    },
                    isEvaluatedSuccessfullyByEvaluator: {
                        isEvaluated: true,
                        date: new Date()
                    },
                    evaluationData: req.body
                },
                { new: true, runValidators: true })
        } else {
            //send back to field agent for reevaluation
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

        }



        return res.status(StatusCodes.OK).json({ status: 'ok' })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    evaluateProperty
}