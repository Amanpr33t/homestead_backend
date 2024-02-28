require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Property = require('../../models/property')
const CustomAPIError = require('../../errors/custom-error')

//The function fetches properties pending for reevaluation by field agent
const pendingPropertiesForReevaluation = async (req, res, next) => {
    try {
        const { type } = req.query
        const page = req.query.page ? parseInt(req.query.page) : 1;  // Current page, default is 1
        const pageSize = 10;  // Number of items per page, default is 10
        const skip = (page - 1) * pageSize;

        let pendingPropertyEvaluations = []
        let numberOfProperties

        if (type !== 'agricultural' && type !== 'residential' && type !== 'commercial') {
            throw new CustomAPIError('Property type name not provided', StatusCodes.BAD_REQUEST)
        }

        pendingPropertyEvaluations = await Property.find({
            addedByFieldAgent: req.fieldAgent._id,
            'sentBackTofieldAgentForReevaluation.isSent': true,
            propertyType: type
        }).select('_id propertyType location sentBackTofieldAgentForReevaluation.date')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize)

        numberOfProperties = await Property.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            'sentBackTofieldAgentForReevaluation.isSent': true,
            propertyType: type
        })

        const totalPages = Math.ceil(numberOfProperties / pageSize)

        return res.status(StatusCodes.OK).json({ status: 'ok', pendingPropertyEvaluations, totalPages })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    pendingPropertiesForReevaluation
}