const express = require('express')
const router = express.Router()
require('express-async-errors')

const authenticateFieldAgent = require('../middleware/authenticateFieldAgent')

const {
    signIn
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
    pendingPropertiesForReevaluation
} = require('../controllers/field-agent/propertyReevaluations')

const {updateReevaluatedPropertyData}=require('../controllers/field-agent/updateReevaluatedPropertyData')

const {
    propertyDealerExists,
    sendOtpToEmailForDealerVerification,
    confirmOtpForDealerVerification,
    addAgriculturalProperty,
    addCommercialProperty,
    addResidentialProperty
} = require('../controllers/field-agent/addProperty')

const {dataForFieldAgentHomePage}=require('../controllers/field-agent/dataForFieldAgentHomePage')

const {
    getProperty,
} = require('../controllers/field-agent/getPropertyDetails')

const {
    requestsToAddNewProperty,
    dealerDetailsForAddProperty
}=require('../controllers/field-agent/requestsToAddNewProperty')

const {
    sendVerificationCodeForFieldAgentVerification,
    confirmVerificationCodeForFieldAgentVerification
} = require('../controllers/field-agent/sendVerificationCodeForLogin')

router.post('/signIn', signIn) //to sign in a field agent
router.patch('/forgotPassword', forgotPassword) //in case the field agent forgets password
router.patch('/updatePassword', updatePassword) //to update a new password for field agent
router.post('/confirmPasswordVerificationToken', confirmPasswordVerificationToken) //to confirm the OTP send by the user for password updation
router.patch('/resetPasswordVerificationToken', resetPasswordVerificationToken) //to reset the value of password verification token in the database

router.post('/addPropertyDealer', authenticateFieldAgent, addPropertyDealer) //to add a property dealer
router.get('/propertyDealerEmailExists', propertyDealerEmailExists) //to check if a property dealer with similar email exists
router.get('/propertyDealerContactNumberExists', propertyDealerContactNumberExists) //to check if a property dealer with similar contact number exists
router.get('/propertyDealerGstNumberExists', propertyDealerGstNumberExists) //to check if a property dealer with similar GST number exists
router.get('/propertyDealerReraNumberExists', propertyDealerReraNumberExists) //to check if a property dealer with similar email exists

router.get('/dataForFieldAgentHomePage', authenticateFieldAgent, dataForFieldAgentHomePage) //to fetch data for field agent home page
router.get('/pendingPropertiesForReevaluation', authenticateFieldAgent, pendingPropertiesForReevaluation) //fetches properties pending for reevaluation by field agent

router.patch('/updateReevaluatedPropertyData', authenticateFieldAgent, updateReevaluatedPropertyData) //to update property data

router.get('/propertyDealerOtpGeneration', authenticateFieldAgent, propertyDealerExists, sendOtpToEmailForDealerVerification) //To send an OTP to property dealer before a field agent can add a proeprty
router.get('/propertyDealerOtpVerification', authenticateFieldAgent, confirmOtpForDealerVerification) //to confirm the OTP sent to property dealer before adding a property

router.post('/addAgriculturalProperty', authenticateFieldAgent, addAgriculturalProperty) //to add an agricultural property
router.post('/addCommercialProperty', authenticateFieldAgent, addCommercialProperty) //to add a commercial property
router.post('/addResidentialProperty', authenticateFieldAgent, addResidentialProperty) //to add an residential property

router.get('/getPropertyData', authenticateFieldAgent, getProperty) //To get details about a property

router.get('/requestsToAddNewProperty', authenticateFieldAgent, requestsToAddNewProperty) 

router.get('/dealerDetailsForAddProperty', authenticateFieldAgent, dealerDetailsForAddProperty) 

router.post('/sendOtpForVerification', sendVerificationCodeForFieldAgentVerification)

router.post('/confirmVerificationCode', confirmVerificationCodeForFieldAgentVerification)

module.exports = router