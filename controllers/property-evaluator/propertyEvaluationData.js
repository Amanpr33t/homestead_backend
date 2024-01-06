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

//The function fetches some data regarding properties pending to be evaluated by the evaluator
const propertiesPendingToBeEvaluated = async (req, res, next) => {
    try {
        const agriculturalPropertyPendingEvaluations = await AgriculturalProperty.find({
            propertyEvaluator: req.propertyEvaluator._id,
            isSentForEvaluation: true
        }).select('_id propertyType location  evaluationRequestDate')

        const commercialPropertyPendingEvaluations = await CommercialProperty.find({
            propertyEvaluator: req.propertyEvaluator._id,
            isSentForEvaluation: true
        }).select('_id propertyType location  evaluationRequestDate')

        const residentailPropertyPendingEvaluations = await ResidentialProperty.find({
            propertyEvaluator: req.propertyEvaluator._id,
            isSentForEvaluation: true
        }).select('_id propertyType location  evaluationRequestDate')

        const pendingPropertyEvaluations = [...agriculturalPropertyPendingEvaluations, ...commercialPropertyPendingEvaluations, ...residentailPropertyPendingEvaluations]

        return res.status(StatusCodes.OK).json({ status: 'ok', pendingPropertyEvaluations })
    } catch (error) {
        next(error)
    }
}

//fetch details of a selected property
const fetchSelectedProperty = async (req, res, next) => {
    try {
        const { propertyType, propertyId } = req.query
        let property
        if (propertyType === 'residential') {
            property = await ResidentialProperty.findOne({ _id: propertyId })
        } else if (propertyType === 'commercial') {
            property = await CommercialProperty.findOne({ _id: propertyId })
        } else if (propertyType === 'agricultural') {
            property = await AgriculturalProperty.findOne({ _id: propertyId })
        }

        return res.status(StatusCodes.OK).json({ status: 'ok', property })
    } catch (error) {
        next(error)
    }
}

//Function to send a property for reevaluation by field agent
const propertyReevaluationOfData = async (req, res, next) => {
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
    propertyEvaluationData,
    propertiesPendingToBeEvaluated,
    fetchSelectedProperty,
    propertyReevaluationOfData,
    successfulEvaluationOfData
}