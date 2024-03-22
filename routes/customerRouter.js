const express = require('express')
const router = express.Router()
require('express-async-errors')

const authenticateCustomer = require('../middleware/authenticateCustomer')

const {
    signIn,
    logout,
    signUp
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

const {
    homePageData: propertDealerPageData,
    fetchProperties: fetchPropertiesForDealerPage
} = require('../controllers/property-dealer/homePageData')

const { reviewProperty } = require('../controllers/customer/reviewProperty')

router.post('/signIn', signIn) //to sign in a property dealer
router.post('/signUp', signUp) //to sign in a property dealer
router.patch('/logout', authenticateCustomer, logout) //to logout a property dealer
router.patch('/forgotPassword', forgotPassword) //in case the property dealer forgets password
router.patch('/updatePassword', updatePassword) //to update a new password for property dealer
router.post('/confirmPasswordVerificationToken', confirmPasswordVerificationToken) //to confirm the OTP send by the user for password updation
router.patch('/resetPasswordVerificationToken', resetPasswordVerificationToken) //to reset the value of password verification token in the database

router.get('/homePageDataForUnsignedUser', homePageData)
router.get('/homePageDataForSignedUser', authenticateCustomer, homePageData)

router.post('/fetchProperties', fetchProperties)

router.get('/fetchDealerDetails', authenticateCustomer, fetchDealerDetails)

router.get('/dataForPropertyDealerPage', propertDealerPageData) //fetch date for home page

router.get('/fetchPropertiesForDealerPage', fetchPropertiesForDealerPage) //fetch date for home page

router.get('/reviewProperty', reviewProperty)

module.exports = router