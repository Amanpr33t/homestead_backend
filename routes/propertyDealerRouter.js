const express = require('express')
const router = express.Router()
require('express-async-errors')

const authenticatePropertyDealer = require('../middleware/authenticatePropertyDealer')

const {
    signIn,
    logout
} = require('../controllers/property-dealer/signIn')

const {
    forgotPassword,
    updatePassword,
    confirmPasswordVerificationToken,
    resetPasswordVerificationToken
} = require('../controllers/property-dealer/forgotPassword')

const { getDealerDetails } = require('../controllers/property-dealer/getPropertyDealerDetails')

const {reviewProperty}=require('../controllers/property-dealer/reviewProperty')

const {
    homePageData,
    fetchProperties
} = require('../controllers/property-dealer/homePageData')

const { assignFieldAgentForPropertyAddition } = require('../controllers/property-dealer/assignFieldAgentForProperty')

const { updateSeenStatusOfCustomerRequest } = require('../controllers/property-dealer/updateSeenStatusOfCustomerRequest')

router.post('/signIn', signIn) //to sign in a property dealer
router.patch('/logout', authenticatePropertyDealer, logout) //to logout a property dealer
router.patch('/forgotPassword', forgotPassword) //in case the property dealer forgets password
router.patch('/updatePassword', updatePassword) //to update a new password for property dealer
router.post('/confirmPasswordVerificationToken', confirmPasswordVerificationToken) //to confirm the OTP send by the user for password updation
router.patch('/resetPasswordVerificationToken', resetPasswordVerificationToken) //to reset the value of password verification token in the database

router.get('/getDealerDetails', authenticatePropertyDealer, getDealerDetails) //to get dealer details

router.get('/homePageData', authenticatePropertyDealer, homePageData) //fetch date for home page

router.get('/fetchProperties', authenticatePropertyDealer, fetchProperties) //fetch date for home page

router.patch('/updateSeenStatusOfCustomerRequest', authenticatePropertyDealer, updateSeenStatusOfCustomerRequest)//used to update 'unseen' status of a customer request to 'seen'

router.post('/assignFieldAgentForPropertyAddition', authenticatePropertyDealer, assignFieldAgentForPropertyAddition)

router.get('/reviewProperty', authenticatePropertyDealer, reviewProperty)

module.exports = router