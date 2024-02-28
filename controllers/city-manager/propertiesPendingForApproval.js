require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Property = require('../../models/property')
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

        if (type !== 'residential' && type !== 'agricultural' && type !== 'commercial') {
            throw new CustomAPIError('property type not provided', StatusCodes.BAD_REQUEST)
        }

        pendingPropertyApprovals = await Property.find({
            cityManager: req.cityManager._id,
            'sentToCityManagerForApproval.isSent': true,
            propertyType: type
        }).select('_id propertyType location sentToCityManagerForApproval.date')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize)

        numberOfProperties = await Property.countDocuments({
            cityManager: req.cityManager._id,
            'sentToCityManagerForApproval.isSent': true,
            propertyType: type
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