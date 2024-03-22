require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Property = require('../../models/property')
const CustomAPIError = require('../../errors/custom-error')

//The function is used to fetch properties added by a property dealer
const closeProperty = async (req, res, next) => {
    try {
        const { propertyId } = req.query

        if (!propertyId || !req.body) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        await Property.findOneAndUpdate({ _id: propertyId },
            {
                $set: {
                    isClosed: true,
                    isLive: false,
                    reasonToCloseProperty: req.body
                }
            },
            { new: true })

        res.status(StatusCodes.OK).json({
            status: 'ok'
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = {
    closeProperty
}

