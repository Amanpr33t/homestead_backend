require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CommercialProperty = require('../../models/commercialProperty')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const ResidentialProperty = require('../../models/residentialProperty')

//Update a property on successful evaluation of data
const successfulEvaluationOfData = async (req, res, next) => {
    try {
        const { propertyType, propertyId } = req.query

        if (propertyType === 'residential') {
            await ResidentialProperty.findOneAndUpdate({ _id: propertyId },
                {
                    isEvaluatedSuccessfully: true,
                    sentBackTofieldAgentForReevaluation: false,
                    isSentForEvaluation: false,
                    evaluationData: req.body
                },
                { new: true, runValidators: true })
        } else if (propertyType === 'agricultural') {
            await AgriculturalProperty.findOneAndUpdate({ _id: propertyId },
                {
                    isEvaluatedSuccessfully: true,
                    sentBackTofieldAgentForReevaluation: false,
                    isSentForEvaluation: false,
                    evaluationData: req.body
                },
                { new: true, runValidators: true })
        } else if (propertyType === 'commercial') {
            await CommercialProperty.findOneAndUpdate({ _id: propertyId },
                {
                    isEvaluatedSuccessfully: true,
                    sentBackTofieldAgentForReevaluation: false,
                    isSentForEvaluation: false,
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
    successfulEvaluationOfData
}