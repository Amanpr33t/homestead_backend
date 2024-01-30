const express = require('express')
const router = express.Router()
require('express-async-errors')

const authenticateFieldAgent = require('../middleware/authenticateFieldAgent')

const {
    signIn,
    logout,
    signup
} = require('../controllers/field-agent/fieldAgentSignin')

const {
    forgotPassword,
    updatePassword,
    confirmPasswordVerificationToken,
    resetPasswordVerificationToken
} = require('../controllers/field-agent/forgotPassword')

const { addPropertyDealer,
    propertyDealerEmailExists,
    propertyDealerContactNumberExists,
    propertyDealerGstNumberExists,
    propertyDealerReraNumberExists
} = require('../controllers/field-agent/addPropertyDealer')

const {
    numberOfPropertyDealersAndPropertiesAddedByFieldAgent,
    propertyDealersAddedByFieldAgent,
    propertyDealerOfaProperty,
    dealerDetails
} = require('../controllers/field-agent/propertiesAndPropertyDealersAddedByFieldAgent')

const {
    numberOfPendingPropertyReevaluations,
    pendingPropertiesForReevaluation,
    reevaluateProperty
} = require('../controllers/field-agent/propertyReevaluations')

const {
    getProperty,
} = require('../controllers/field-agent/getPropertyDetails')

const {
    propertiesAddedByFieldAgent
} = require('../controllers/field-agent/fetchProperties')

const {
    propertyDealerExists,
    sendOtpToEmailForDealerVerification,
    confirmOtpForDealerVerification,
    addAgriculturalProperty,
    addCommercialProperty,
    addResidentialProperty
} = require('../controllers/field-agent/addProperty')

router.post('/signIn', signIn) //to sign in a field agent
router.patch('/logout', authenticateFieldAgent, logout) //to logout a field agent
router.post('/signUp', signup)
router.patch('/forgotPassword', forgotPassword) //in case the field agent forgets password
router.patch('/updatePassword', updatePassword) //to update a new password for field agent
router.post('/confirmPasswordVerificationToken', confirmPasswordVerificationToken) //to confirm the OTP send by the user for password updation
router.patch('/resetPasswordVerificationToken', resetPasswordVerificationToken) //to reset the value of password verification token in the database

router.post('/addPropertyDealer', authenticateFieldAgent, addPropertyDealer) //to add a property dealer
router.get('/propertyDealerEmailExists', propertyDealerEmailExists) //to check if a property dealer with similar email exists
router.get('/propertyDealerContactNumberExists', propertyDealerContactNumberExists) //to check if a property dealer with similar contact number exists
router.get('/propertyDealerGstNumberExists', propertyDealerGstNumberExists) //to check if a property dealer with similar GST number exists
router.get('/propertyDealerReraNumberExists', propertyDealerReraNumberExists) //to check if a property dealer with similar email exists

router.get('/numberOfPropertyDealersAndPropertiesAddedByFieldAgent', authenticateFieldAgent, numberOfPropertyDealersAndPropertiesAddedByFieldAgent) //to get the number of properties and proerty dealers added by the field agent
router.get('/propertyDealersAddedByFieldAgent', authenticateFieldAgent, propertyDealersAddedByFieldAgent) //to get the property dealers added by the field agent
router.get('/getDealerDetails', authenticateFieldAgent, dealerDetails) //to get the property dealer details
router.get('/propertiesAddedByFieldAgent', authenticateFieldAgent, propertiesAddedByFieldAgent)  //to get the properties added by the field agent
router.get('/propertyDealerOfaProperty/:id', authenticateFieldAgent, propertyDealerOfaProperty) //to get the firmName of a property dealer of aproeprty
router.get('/numberOfPropertiesPendingToBeReevaluated', authenticateFieldAgent, numberOfPendingPropertyReevaluations) //To get number of property pending for reevaluation by field agent
router.get('/pendingPropertiesForReevaluation', authenticateFieldAgent, pendingPropertiesForReevaluation) //fetches properties pending for reevaluation by field agent
router.get('/getPropertyData', authenticateFieldAgent, getProperty) //To get details about a property
router.post('/reevaluatePropertyData', authenticateFieldAgent, reevaluateProperty) //To update property data after reevaluation

router.get('/propertyDealerOtpGeneration', authenticateFieldAgent, propertyDealerExists, sendOtpToEmailForDealerVerification) //To send an OTP to property dealer before a field agent can add a proeprty
router.get('/propertyDealerOtpVerification', authenticateFieldAgent, confirmOtpForDealerVerification) //to confirm the OTP sent to property dealer before adding a property
router.post('/addAgriculturalProperty', authenticateFieldAgent, addAgriculturalProperty) //to add an agricultural property
router.post('/addCommercialProperty', authenticateFieldAgent, addCommercialProperty) //to add a commercial property
router.post('/addResidentialProperty', authenticateFieldAgent, addResidentialProperty) //to add an residential property

module.exports = router