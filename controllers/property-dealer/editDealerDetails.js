require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const CustomAPIError = require('../../errors/custom-error')

//The function is used to fetch properties added by a property dealer
const editDealerDetails = async (req, res, next) => {
    try {
        await PropertyDealer.findOneAndUpdate(
            { _id: req.propertyDealer._id },
            req.body,
            { new: true }
        )

        res.status(StatusCodes.OK).json({
            status: 'ok'
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = {
    editDealerDetails
}

