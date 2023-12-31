const express = require('express')
const router = express.Router()
require('express-async-errors')

const authenticatePropertyDealer = require('../middleware/authenticatePropertyDealer')

const {
    addPropertyDealer,
    propertyDealerEmailExists,
    propertyDealerContactNumberExists,
    propertyDealerGstNumberExists,
    propertyDealerReraNumberExists
} = require('../controllers/property-dealer/addPropertyDealer')

const {
    signIn,
    logout
} = require('../controllers/property-dealer/signIn')

router.post('/addPropertyDealer', addPropertyDealer) //to add a property dealer
router.get('/propertyDealerEmailExists', propertyDealerEmailExists) //to check if a property dealer with similar email exists
router.get('/propertyDealerContactNumberExists', propertyDealerContactNumberExists) //to check if a property dealer with similar contact number exists
router.get('/propertyDealerGstNumberExists', propertyDealerGstNumberExists) //to check if a property dealer with similar GST number exists
router.get('/propertyDealerReraNumberExists', propertyDealerReraNumberExists) //to check if a property dealer with similar email exists

router.post('/signIn', signIn) //to sign in a property dealer
router.patch('/logout', authenticatePropertyDealer, logout) //to logout a property dealer

module.exports = router