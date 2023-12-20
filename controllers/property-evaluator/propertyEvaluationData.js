require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CommercialProperty = require('../../models/commercialProperty')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const ResidentialProperty = require('../../models/residentialProperty')
const FieldAgent = require('../../models/fieldAgent')
const PropertyEvaluator = require('../../models/propertyEvaluator')

/*The function is used to send to the user the following data:
1) Number of properties successfully evaluated by the evaluator
2) Number of properties sent to the for reconsideration to the field agent by the evaluator
3) Number of pending property evaluations
*/
const propertyEvaluationData = async (req, res, next) => {
    try {
        const propertiesSuccessfullyEvaluated = req.propertyEvaluator.propertiesSuccessfullyEvaluated.agricultural.length + req.propertyEvaluator.propertiesSuccessfullyEvaluated.residential.length + req.propertyEvaluator.propertiesSuccessfullyEvaluated.commercial.length

        const propertiesSentToFieldAgentForReconsideration = req.propertyEvaluator.propertiesSentToFieldAgentForReconsideration.agricultural.length + req.propertyEvaluator.propertiesSentToFieldAgentForReconsideration.residential.length + req.propertyEvaluator.propertiesSentToFieldAgentForReconsideration.commercial.length

        const pendingPropertyEvaluations = req.propertyEvaluator.pendingPropertyEvaluations.length

        return res.status(StatusCodes.OK).json({ status: 'ok', propertiesSuccessfullyEvaluated, propertiesSentToFieldAgentForReconsideration, pendingPropertyEvaluations })
    } catch (error) {
        next(error)
    }
}

const propertiesPendingToBeEvaluated = async (req, res, next) => {
    try {
        const pendingPropertyEvaluations = req.propertyEvaluator.pendingPropertyEvaluations

        return res.status(StatusCodes.OK).json({ status: 'ok', pendingPropertyEvaluations })
    } catch (error) {
        next(error)
    }
}

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

const propertyReevaluationOfData = async (req, res, next) => {
    try {
        const { propertyType, propertyId, evaluatorId, fieldAgentId } = req.query

        if (propertyType === 'residential') {
            await ResidentialProperty.findOneAndUpdate({ _id: propertyId },
                {
                    sentBackTofieldAgentForReevaluation: true,
                    evaluationData: req.body
                },
                { new: true, runValidators: true })
        } else if (propertyType === 'agricultural') {
            await AgriculturalProperty.findOneAndUpdate({ _id: propertyId },
                {
                    sentBackTofieldAgentForReevaluation: true,
                    evaluationData: req.body
                },
                { new: true, runValidators: true })
        } else if (propertyType === 'commercial') {
            await CommercialProperty.findOneAndUpdate({ _id: propertyId },
                {
                    sentBackTofieldAgentForReevaluation: true,
                    evaluationData: req.body
                },
                { new: true, runValidators: true })
        }


        const fieldAgent = await FieldAgent.findOne({ _id: fieldAgentId })
        if (fieldAgent) {
            let updatedpropertyReceivedForReevaluation
            if (propertyType === 'residential') {
                updatedpropertyReceivedForReevaluation = {
                    agricultural: fieldAgent.propertyReceivedForReevaluation.agricultural,
                    residential: [...fieldAgent.propertyReceivedForReevaluation.residential, propertyId],
                    commercial: fieldAgent.propertyReceivedForReevaluation.commercial
                }
            } else if (propertyType === 'agricultural') {
                updatedpropertyReceivedForReevaluation = {
                    agricultural: [...fieldAgent.propertyReceivedForReevaluation.agricultural, propertyId],
                    residential: fieldAgent.propertyReceivedForReevaluation.residential,
                    commercial: fieldAgent.propertyReceivedForReevaluation.commercial
                }
            } else if (propertyType === 'commercial') {
                updatedpropertyReceivedForReevaluation = {
                    agricultural: fieldAgent.propertyReceivedForReevaluation.agricultural,
                    residential: fieldAgent.propertyReceivedForReevaluation.residential,
                    commercial: [...fieldAgent.propertyReceivedForReevaluation.commercial, propertyId]
                }
            }
            await FieldAgent.findOneAndUpdate({ _id: fieldAgentId },
                {
                    propertyReceivedForReevaluation: updatedpropertyReceivedForReevaluation
                },
                { new: true, runValidators: true })
        }

        let updatePropertiesSentToFieldAgentForReevaluation
        if (propertyType === 'residential') {
            updatePropertiesSentToFieldAgentForReevaluation = {
                agricultural: req.propertyEvaluator.propertiesSentToFieldAgentForReconsideration.agricultural,
                residential: [...req.propertyEvaluator.propertiesSentToFieldAgentForReconsideration.residential, propertyId],
                commercial: req.propertyEvaluator.propertiesSentToFieldAgentForReconsideration.commercial
            }
        } else if (propertyType === 'agricultural') {
            updatePropertiesSentToFieldAgentForReevaluation = {
                agricultural: [...req.propertyEvaluator.propertiesSentToFieldAgentForReconsideration.agricultural, propertyId],
                residential: req.propertyEvaluator.propertiesSentToFieldAgentForReconsideration.residential,
                commercial: req.propertyEvaluator.propertiesSentToFieldAgentForReconsideration.commercial
            }
        } else if (propertyType === 'commercial') {
            updatePropertiesSentToFieldAgentForReevaluation = {
                agricultural: req.propertyEvaluator.propertiesSentToFieldAgentForReconsideration.agricultural,
                residential: req.propertyEvaluator.propertiesSentToFieldAgentForReconsideration.residential,
                commercial: [...req.propertyEvaluator.propertiesSentToFieldAgentForReconsideration.commercial, propertyId]
            }
        }
        const updatePendingPropertyEvaluations = req.propertyEvaluator.pendingPropertyEvaluations.filter(data => data.propertyId !== propertyId)

        await PropertyEvaluator.findOneAndUpdate({ _id: evaluatorId },
            {
                propertiesSentToFieldAgentForReconsideration: updatePropertiesSentToFieldAgentForReevaluation,
                pendingPropertyEvaluations: updatePendingPropertyEvaluations
            },
            { new: true, runValidators: true })
        return res.status(StatusCodes.OK).json({ status: 'ok' })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

const successfulEvaluationOfData = async (req, res, next) => {
    try {
        const { propertyType, propertyId, evaluatorId, fieldAgentId } = req.query

        let propertiesSuccessfullyEvaluatedUpdated
        if (propertyType === 'residential') {
            propertiesSuccessfullyEvaluatedUpdated = {
                agricultural: req.propertyEvaluator.propertiesSuccessfullyEvaluated.agricultural,
                residential: [...req.propertyEvaluator.propertiesSuccessfullyEvaluated.residential, propertyId],
                commercial: req.propertyEvaluator.propertiesSuccessfullyEvaluated.commercial
            }
        } else if (propertyType === 'agricultural') {
            propertiesSuccessfullyEvaluatedUpdated = {
                agricultural: [...req.propertyEvaluator.propertiesSuccessfullyEvaluated.agricultural, propertyId],
                residential: req.propertyEvaluator.propertiesSuccessfullyEvaluated.residential,
                commercial: req.propertyEvaluator.propertiesSuccessfullyEvaluated.commercial
            }
        } else if (propertyType === 'commercial') {
            propertiesSuccessfullyEvaluatedUpdated = {
                agricultural: req.propertyEvaluator.propertiesSuccessfullyEvaluated.agricultural,
                residential: req.propertyEvaluator.propertiesSuccessfullyEvaluated.residential,
                commercial: [...req.propertyEvaluator.propertiesSuccessfullyEvaluated.commercial, propertyId]
            }
        }

        const pendingPropertyEvaluationsUpdated = req.propertyEvaluator.pendingPropertyEvaluations.filter(property => property.propertyId !== propertyId)

        await PropertyEvaluator.findOneAndUpdate({ _id: evaluatorId },
            {
                propertiesSuccessfullyEvaluated: propertiesSuccessfullyEvaluatedUpdated,
                pendingPropertyEvaluations: pendingPropertyEvaluationsUpdated
            },
            { new: true, runValidators: true })

        if (propertyType === 'residential') {
            await ResidentialProperty.findOneAndUpdate({ _id: propertyId },
                {
                    isEvaluatedSuccessfully: true,
                    evaluationData: req.body
                },
                { new: true, runValidators: true })
        } else if (propertyType === 'agricultural') {
            await AgriculturalProperty.findOneAndUpdate({ _id: propertyId },
                {
                    isEvaluatedSuccessfully: true,
                    evaluationData: req.body
                },
                { new: true, runValidators: true })
        } else if (propertyType === 'commercial') {
            await CommercialProperty.findOneAndUpdate({ _id: propertyId },
                {
                    isEvaluatedSuccessfully: true,
                    evaluationData: req.body
                },
                { new: true, runValidators: true })
        }
        return res.status(StatusCodes.OK).json({ status: 'ok' })
    } catch (error) {
        console.log(error)
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