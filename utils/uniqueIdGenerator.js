require('express-async-errors')
const Property = require('../models/property')
const PropertyDealer = require('../models/propertyDealer')

//The function is used to generate a unique ID for a property
const uniqueIdGeneratorForProperty = async (propertyType, state) => {

    const properties = await Property.countDocuments({propertyType})
    const serialNumber = properties.length + 1

    const year = new Date().getFullYear()

    let stateCode
    if (state.toLowerCase() === 'punjab') {
        stateCode = 'PB'
    } else if (state.toLowerCase() === 'chandigarh') {
        stateCode = 'CH'
    }

    return `P${propertyType.charAt(0).toUpperCase()}${year.toString().slice(-2)}${stateCode}${serialNumber}`
}

//The function is used to generate a unique ID for a property daler
const uniqueIdGeneratorForPropertyDealer = async () => {
    const propertyDealers = await PropertyDealer.find()
    const serialNumber = propertyDealers.length + 1

    const year = new Date().getFullYear()
    const month = new Date().getMonth()

    return `PD${month + 1}${year.toString().slice(-2)}${serialNumber}`
}

module.exports = {
    uniqueIdGeneratorForProperty,
    uniqueIdGeneratorForPropertyDealer
}