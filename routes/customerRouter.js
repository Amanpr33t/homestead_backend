const express = require('express')
const router = express.Router()
require('express-async-errors')

const authenticateCustomer = require('../middleware/authenticateCustomer')

const {
    signIn
} = require('../controllers/customer/signIn')

const {
    forgotPassword,
    updatePassword,
    confirmPasswordVerificationToken,
    resetPasswordVerificationToken
} = require('../controllers/customer/forgotPassword')

const {
    homePageData,
    fetchProperties
} = require('../controllers/customer/homePageData')

const {
    fetchDealerDetails
} = require('../controllers/customer/fetchDealerDetails')

const { propertyDealerPageData } = require('../controllers/customer/propertDealerPageData')

const {
    fetchProperties: fetchPropertiesForDealerPage
} = require('../controllers/property-dealer/homePageData')

const { reviewProperty } = require('../controllers/customer/reviewProperty')

const { addReviewForDealer } = require('../controllers/customer/addReviewForDealer')

const {
    customerContactNumberExists,
    customerEmailExists,
    addCustomer
} = require('../controllers/customer/addCustomer')

const {
    sendVerificationCodeForVerification,
    confirmVerificationCodeForCustomer
} = require('../controllers/customer/sendVerificationCodeForLogin')

const {
    fetchCustomerDetails
} = require('../controllers/customer/fetchCustomerDetails')

const {
    editCustomerDetails
} = require('../controllers/customer/editCustomerDetails')

router.post('/signIn', signIn) //to sign in a property dealer
router.patch('/forgotPassword', forgotPassword) //in case the property dealer forgets password
router.patch('/updatePassword', updatePassword) //to update a new password for property dealer
router.post('/confirmPasswordVerificationToken', confirmPasswordVerificationToken) //to confirm the OTP send by the user for password updation
router.patch('/resetPasswordVerificationToken', resetPasswordVerificationToken) //to reset the value of password verification token in the database

router.get('/homePageDataForUnsignedUser', homePageData)
router.get('/homePageDataForSignedUser', authenticateCustomer, homePageData)

router.post('/fetchProperties', fetchProperties)

router.get('/fetchDealerDetails', authenticateCustomer, fetchDealerDetails)

router.get('/dataForPropertyDealerPage', propertyDealerPageData) //fetch date for home page

router.get('/fetchPropertiesForDealerPage', fetchPropertiesForDealerPage) //fetch date for home page

router.get('/reviewProperty', reviewProperty)

router.get('/fetchUserDetials',authenticateCustomer, fetchCustomerDetails)

router.patch('/addReviewForPropertyDealer', authenticateCustomer, addReviewForDealer)

router.patch('/editCustomerDetails', authenticateCustomer, editCustomerDetails)

router.get('/customerEmailExists',customerEmailExists) //to check if a property dealer with similar email exists
router.get('/customerContactNumberExists', customerContactNumberExists) //to check if a property dealer with similar contact number exists

router.post('/addCustomer', addCustomer)

router.post('/sendOtpForVerification', sendVerificationCodeForVerification)

router.post('/confirmVerificationCode', confirmVerificationCodeForCustomer)

module.exports = router