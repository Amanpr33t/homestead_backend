const express = require('express')
const router = express.Router()
require('express-async-errors')

const {
    fetchSelectedProperty
} = require('../controllers/fetchSelectedProperty')

router.get('/fetch-selected-property', fetchSelectedProperty) 

module.exports = router