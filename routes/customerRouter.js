const express = require('express')
const router = express.Router()
require('express-async-errors')
const authenticatePropertyEvaluator = require('../middleware/authenticatePropertyEvaluator')

const {
    addCustomer
} = require('../controllers/customer/addCustomer')

const {
    sendRequestToPropertyDealer
} = require('../controllers/customer/sendRequestToPropertyDealer')

router.post('/addCustomer', addCustomer) 

router.patch('/sendRequestToPropertyDealer', sendRequestToPropertyDealer) 

module.exports = router