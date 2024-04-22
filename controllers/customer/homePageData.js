require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer');
const Property = require('../../models/property');
const CustomAPIError = require('../../errors/custom-error');

const fetchBestDeals = async (queryForBestDeals) => {
    const bestDeals = await Property.aggregate([
        {
            $match: queryForBestDeals
        },
        {
            $addFields: {
                fairValueOfProperty: { $ifNull: ['$evaluationData.fairValueOfProperty', 0] }
            }
        },
        {
            $match: {
                $expr: { $lt: ['$price', '$fairValueOfProperty'] }
            }
        },
        {
            $project: {
                _id: 1, // Exclude the _id field
                price: 1, // Include the price field
                fairValueOfProperty: 1, // Include the fairValueOfProperty field,
                propertyType: 1,
                location: 1,
                propertyImagesUrl: 1,
                'isApprovedByCityManager.date': 1,
                price: 1,
                title: 1,
                addedByPropertyDealer: 1
            }
        },
        {
            $sort: {
                'isApprovedByCityManager.date': -1
                // Use -1 for descending order
            }
        },
        {
            $limit: 5
        }
    ])
    return bestDeals
}

const fetchTopDealersNearCustomer = async (district, state) => {
    const commonQueryData = [{
        $unwind: "$reviewsFromCustomer" // Unwind the reviews array
    },
    {
        $group: {
            _id: {
                _id: "$_id",
                firmLogoUrl: "$firmLogoUrl",
                district: "$address.district",
                state: "$address.state",
                firmName: "$firmName"
            },
            averageRating: { $avg: "$reviewsFromCustomer.rating" } // Calculate average rating
        }
    },
    {
        $project: {
            _id: "$_id._id",
            firmLogoUrl: "$_id.firmLogoUrl",
            district: "$_id.district",
            state: "$_id.state",
            firmName: "$_id.firmName",
            averageRating: { $round: ["$averageRating", 1] } // Fix average rating to one decimal point
        }
    },

    {
        $sort: { totalRating: -1 } // Sort in descending order of total rating
    },
    {
        $limit: 5 // Limit to top 5
    }]

    let topPropertyDealers
    if (district && state) {
        topPropertyDealers = await PropertyDealer.aggregate([
            {
                $match: { 'address.district': district } // Match property dealers from the specified district
            },
            ...commonQueryData
        ])

        if (topPropertyDealers.length === 0) {
            topPropertyDealers = await PropertyDealer.aggregate([
                {
                    $match: { 'address.state': state } // Match property dealers from the specified district
                },
                ...commonQueryData
            ])
            if (topPropertyDealers.length === 0) {
                topPropertyDealers = await PropertyDealer.aggregate([
                    ...commonQueryData
                ])
            }
        }
    } else {
        topPropertyDealers = await PropertyDealer.aggregate([
            ...commonQueryData
        ])
    }

    return topPropertyDealers
}

//The function is used to fetch all requests by customers
const homePageData = async (req, res, next) => {
    try {
        let baseQueryForBestDeals = {
            isLive: true,
            isClosed: false,
            'evaluationData.fiveYearProjectionOfPrices.increase': true,
            'evaluationData.fiveYearProjectionOfPrices.decrease': false
        }

        let queryForBestDeals = { ...baseQueryForBestDeals }

        if (req.customer) {
            queryForBestDeals = {
                ...baseQueryForBestDeals,
                'location.name.district': req.customer.district
            }
        }

        let bestDeals
        bestDeals = await fetchBestDeals(queryForBestDeals)

        if (req.customer && bestDeals && bestDeals.length === 0) {
            queryForBestDeals = {
                ...baseQueryForBestDeals,
                'location.name.state': req.customer.state
            }
            bestDeals = await fetchBestDeals(queryForBestDeals)
            if (bestDeals && bestDeals.length === 0) {
                bestDeals = await fetchBestDeals(baseQueryForBestDeals)
            }
        }

        let topDealers
        if (req.customer) {
            topDealers = await fetchTopDealersNearCustomer(req.customer.district, req.customer.statel)
        } else {
            topDealers = await fetchTopDealersNearCustomer(null, null)
        }

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            bestDeals,
            topDealers
        })
    } catch (error) {
        next(error)
    }
}

const fetchProperties = async (req, res, next) => {
    try {
        const { skip, filters, sort } = req.body
        if (!filters) {
            throw new CustomAPIError('filters data not provided', 204)
        }

        let sortObject = { 'isApprovedByCityManager.date': -1 }

        if (sort === 'lowToHigh') {
            sortObject = {
                price: 1
            }
        } else if (sort === 'highToLow') {
            sortObject = {
                price: -1
            }
        } else if (sort === 'oldToNew') {
            sortObject = {
                'isApprovedByCityManager.date': 1
            }
        } else if (sort === 'newToOld') {
            sortObject = {
                'isApprovedByCityManager.date': -1
            }
        }

        const pageSize = 5

        let queryBody = {
            isLive: true,
            isClosed: false,
        }

        if (filters.state) {
            queryBody = {
                ...queryBody,
                'location.name.state': filters.state
            }
        }

        if (filters.district) {
            queryBody = {
                ...queryBody,
                'location.name.district': filters.district
            }
        }

        if (filters.price) {
            if (filters.price.min && filters.price.max) {
                queryBody = {
                    ...queryBody,
                    price: { $gte: filters.price.min, $lte: filters.price.max }
                }
            } else if (filters.price.min) {
                queryBody = {
                    ...queryBody,
                    price: { $gte: filters.price.min }
                }
            } else if (filters.price.max) {
                queryBody = {
                    ...queryBody,
                    price: { $lte: filters.price.max }
                }
            }
        }

        if (filters.propertyType) {
            queryBody = {
                ...queryBody,
                propertyType: filters.propertyType
            }
            if (filters.propertyType === 'resdiential') {
                if (filters.residentialPropertyType) {
                    queryBody = {
                        ...queryBody,
                        residentialPropertyType: filters.residentialPropertyType
                    }
                }
            } else if (filters.propertyType === 'commercial') {
                if (filters.commercialPropertyType) {
                    queryBody = {
                        ...queryBody,
                        commercialPropertyType: filters.commercialPropertyType
                    }
                }
                if (filters.builtupOrEmpty === 'empty') {
                    queryBody = {
                        ...queryBody,
                        'stateOfProperty.empty': true,
                        'stateOfProperty.builtUp': false
                    }
                } else if (filters.builtupOrEmpty === 'built-up') {
                    queryBody = {
                        ...queryBody,
                        'stateOfProperty.empty': false,
                        'stateOfProperty.builtUp': true
                    }
                }
                if (filters.builtUpPropertyType) {
                    queryBody = {
                        ...queryBody,
                        'stateOfProperty.empty': false,
                        'stateOfProperty.builtUp': true,
                        'stateOfProperty.builtUpPropertyType': filters.builtUpPropertyType
                    }
                }
            }
        }

        let totalNumberOfProperties

        let properties = await Property.find(queryBody)
            .select('_id price fairValueOfProperty propertyType location propertyImagesUrl isApprovedByCityManager.date price title addedByPropertyDealer')
            .sort(sortObject)
            .skip(skip || 0)
            .limit(pageSize)

        totalNumberOfProperties = await Property.countDocuments(queryBody)

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            properties,
            totalNumberOfProperties
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    homePageData,
    fetchProperties
}

