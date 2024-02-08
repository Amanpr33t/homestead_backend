require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CommercialProperty = require('../../models/commercialProperty')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const ResidentialProperty = require('../../models/residentialProperty')
const CustomAPIError = require('../../errors/custom-error')

//The function fetches some data regarding properties pending to be evaluated by the evaluator
const propertiesPendingForApproval = async (req, res, next) => {
    try {
        const { type } = req.query
        const page = req.query.page ? parseInt(req.query.page) : 1;  // Current page, default is 1
        const pageSize = 10;  // Number of items per page, default is 10
        const skip = (page - 1) * pageSize;

        let pendingPropertyApprovals = []
        let numberOfProperties

        let selectedModel
        if (type === 'residential') {
            selectedModel = ResidentialProperty
        } else if (type === 'agricultural') {
            selectedModel = AgriculturalProperty
        } else if (type === 'commercial') {
            selectedModel = CommercialProperty
        } else {
            throw new CustomAPIError('Model name not provided', StatusCodes.BAD_REQUEST)
        }

        pendingPropertyApprovals = await selectedModel.find({
            cityManager: req.cityManager._id,
            'sentToCityManagerForApproval.isSent': true
        }).select('_id propertyType location sentToCityManagerForApproval.date')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize)

        numberOfProperties = await selectedModel.countDocuments({
            cityManager: req.cityManager._id,
            'sentToCityManagerForApproval.isSent': true
        })

        const totalPages = Math.ceil(numberOfProperties / pageSize)

        return res.status(StatusCodes.OK).json({ status: 'ok', pendingPropertyApprovals, totalPages })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    propertiesPendingForApproval
}