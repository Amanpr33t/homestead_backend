const express = require('express')
const router = express.Router()
const { signIn, logout, signup } = require('../controllers/field-agent/fieldAgentSignin')
const { forgotPassword, updatePassword, confirmPasswordVerificationToken, resetPasswordVerificationToken } = require('../controllers/field-agent/forgotPassword')
const authenticateFieldAgent = require('../middleware/authenticateFieldAgent')
const { addPropertyDealer, propertyDealerEmailExists, propertyDealerContactNumberExists, propertyDealerGstNumberExists } = require('../controllers/field-agent/addPropertyDealer')
const { numberOfPropertyDealersAndPropertiesAddedByFieldAgent, propertyDealersAddedByFieldAgent, agriculturalPropertiesAddedByFieldAgent, propertyDealerOfaProperty } = require('../controllers/field-agent/propertiesAndPropertyDealersAddedByFieldAgent')
const { propertyDealerExists, sendOtpToEmailForDealerVerification, confirmOtpForDealerVerification, addAgriculturalProperty } = require('../controllers/field-agent/addProperty')

router.post('/signIn', signIn)
router.patch('/logout', authenticateFieldAgent, logout)
router.post('/signUp', signup)
router.patch('/forgotPassword', forgotPassword)
router.patch('/updatePassword', updatePassword)
router.post('/confirmPasswordVerificationToken', confirmPasswordVerificationToken)
router.patch('/resetPasswordVerificationToken', resetPasswordVerificationToken)

router.post('/addPropertyDealer', authenticateFieldAgent, addPropertyDealer)
router.get('/propertyDealerEmailExists', propertyDealerEmailExists)
router.get('/propertyDealerContactNumberExists', propertyDealerContactNumberExists)
router.get('/propertyDealerGstNumberExists', propertyDealerGstNumberExists)

router.get('/numberOfPropertyDealersAndPropertiesAddedByFieldAgent', authenticateFieldAgent, numberOfPropertyDealersAndPropertiesAddedByFieldAgent)
router.get('/propertyDealersAddedByFieldAgent', authenticateFieldAgent, propertyDealersAddedByFieldAgent)
router.get('/agriculturalPropertiesAddedByFieldAgent', authenticateFieldAgent, agriculturalPropertiesAddedByFieldAgent)
router.get('/propertyDealerOfaProperty/:id', authenticateFieldAgent, propertyDealerOfaProperty)

router.get('/propertyDealerOtpGeneration', authenticateFieldAgent, propertyDealerExists, sendOtpToEmailForDealerVerification)
router.get('/propertyDealerOtpVerification', authenticateFieldAgent, confirmOtpForDealerVerification)
router.post('/addAgriculturalProperty', authenticateFieldAgent, addAgriculturalProperty)

module.exports = router