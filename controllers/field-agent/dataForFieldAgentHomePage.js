require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const Property = require('../../models/property')
const FieldAgent = require('../../models/fieldAgent')
const CustomAPIError = require('../../errors/custom-error')

////The function provides the number of proeprties and property dealers added by the field agent
const dataForFieldAgentHomePage = async (req, res, next) => {
    try {
        const agriculturalPropertiesApprovedByCityManager = await Property.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            'isApprovedByCityManager.isApproved': true,
            propertyType: 'agricultural'
        })
        const commercialPropertiesApprovedByCityManager = await Property.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            'isApprovedByCityManager.isApproved': true,
            propertyType: 'commercial'
        })
        const residentialPropertiesApprovedByCityManager = await Property.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            'isApprovedByCityManager.isApproved': true,
            propertyType: 'residential'
        })
        const numberOfPropertiesApprovedByCityManager = agriculturalPropertiesApprovedByCityManager + commercialPropertiesApprovedByCityManager + residentialPropertiesApprovedByCityManager

        const agriculturalPropertiesAdded = await Property.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            propertyType: 'agricultural'
        })
        const residentialPropertiesAdded = await Property.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            propertyType: 'residential'
        })
        const commercialPropertiesAdded = await Property.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            propertyType: 'commercial'
        })
        const numberOfPropertiesAdded = agriculturalPropertiesAdded + residentialPropertiesAdded + commercialPropertiesAdded

        const numberOfPropertyDealersAdded = await PropertyDealer.countDocuments({
            addedByFieldAgent: req.fieldAgent._id
        })

        const agriculturalPropertiesPendingForReevaluation = await Property.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            'sentBackTofieldAgentForReevaluation.isSent': true,
            propertyType: 'agricultural'
        })
        const residentialPropertiesPendingForReevaluation = await Property.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            'sentBackTofieldAgentForReevaluation.isSent': true,
            propertyType: 'residential'
        })
        const commercialPropertiesPendingForReevaluation = await Property.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            'sentBackTofieldAgentForReevaluation.isSent': true,
            propertyType: 'commercial'
        })
        const pendingPropertyReevaluations = {
            agricultural: agriculturalPropertiesPendingForReevaluation,
            residential: residentialPropertiesPendingForReevaluation,
            commercial: commercialPropertiesPendingForReevaluation
        }

        const requestsToAddProperty = await FieldAgent.aggregate([
            {
                $project: {
                    arrayLength: { $size: "$requestsToAddProperty" }
                }
            }
        ])

        res.status(StatusCodes.OK).json({
            status: 'ok',
            numberOfPropertiesApprovedByCityManager,
            numberOfPropertiesAdded,
            numberOfPropertyDealersAdded,
            pendingPropertyReevaluations,
            requestsToAddProperty: requestsToAddProperty[0].arrayLength
        })
        return
    } catch (error) {
        next(error)
    }
}

module.exports = {
    dataForFieldAgentHomePage
}