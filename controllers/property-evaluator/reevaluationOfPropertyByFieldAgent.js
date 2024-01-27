require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CommercialProperty = require('../../models/commercialProperty')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const ResidentialProperty = require('../../models/residentialProperty')

//Function to send a property for reevaluation by field agent
const reevaluationOfPropertyData = async (req, res, next) => {
    try {
        const { propertyType, propertyId, numberOfReevaluationsReceived } = req.query

        if (propertyType === 'residential') {
            await ResidentialProperty.findOneAndUpdate({ _id: propertyId },
                {
                    sentBackTofieldAgentForReevaluation: true,
                    isSentForEvaluation: false,
                    evaluationData: req.body,
                    numberOfReevaluationsReceived: numberOfReevaluationsReceived + 1
                },
                { new: true, runValidators: true })
        } else if (propertyType === 'agricultural') {
            await AgriculturalProperty.findOneAndUpdate({ _id: propertyId },
                {
                    sentBackTofieldAgentForReevaluation: true,
                    isSentForEvaluation: false,
                    evaluationData: req.body,
                    numberOfReevaluationsReceived: numberOfReevaluationsReceived + 1
                },
                { new: true, runValidators: true })
        } else if (propertyType === 'commercial') {
            await CommercialProperty.findOneAndUpdate({ _id: propertyId },
                {
                    sentBackTofieldAgentForReevaluation: true,
                    isSentForEvaluation: false,
                    evaluationData: req.body,
                    numberOfReevaluationsReceived: numberOfReevaluationsReceived + 1
                },
                { new: true, runValidators: true })
        }

        return res.status(StatusCodes.OK).json({ status: 'ok' })
    } catch (error) {
        next(error)
    }
}


module.exports = {
    reevaluationOfPropertyData
}