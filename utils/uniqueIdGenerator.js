require('express-async-errors')
const CommercialProperty = require('../models/commercialProperty')
const AgriculturalProperty = require('../models/agriculturalProperty')
const PropertyDealer = require('../models/propertyDealer')
const FieldAgent= require('../models/fieldAgent')

const uniqueIdGeneratorForProperty = async (propertyType, state) => {

    let serialNumber
    if (propertyType === 'commercial') {
        const properties = await CommercialProperty.find()
        serialNumber = properties.length + 1
    } else if (propertyType === 'agricultural') {
        const properties = await AgriculturalProperty.find()
        serialNumber = properties.length + 1
    } else if (propertyType === 'residential') {

    }

    let type
    if (propertyType === 'agricultural') {
        type = 'A'
    } else if (propertyType === 'commercial') {
        type = 'C'
    } else if (propertyType === 'residential') {
        type = 'R'
    }

    const year = new Date().getFullYear()

    let stateCode
    if (state.toLowerCase() === 'punjab') {
        stateCode = 'PB'
    } else if (state.toLowerCase() === 'chandigarh') {
        stateCode = 'CH'
    }

    return `P${type}${year.toString().slice(-2)}${stateCode}${serialNumber}`
}

const uniqueIdGeneratorForPropertyDealer = async () => {
    const propertyDealers = await PropertyDealer.find()
    const serialNumber = propertyDealers.length + 1

    const year = new Date().getFullYear()
    const date = new Date().getMonth()

    return `PD${date + 1}${year.toString().slice(-2)}${serialNumber}`
}

module.exports = {
    uniqueIdGeneratorForProperty, uniqueIdGeneratorForPropertyDealer
}