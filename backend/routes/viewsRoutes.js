const express = require('express')
const viewsController = require('../controllers/viewsController.js')
const bookingController = require('../controllers/bookingController.js')
const authController = require('../controllers/authController')

const router = express.Router()

// now all below pages have access to current user
// router.use(authController.isLoggedIn)

router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewsController.getOverview)
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour)
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm)
router.get('/signup', viewsController.getSignupForm)
router.get('/me', authController.protect, viewsController.getAccount)
router.get('/my-tours', authController.protect, viewsController.getMyTours)

router.post('/submit-user-data', authController.protect, viewsController.updateUserData)


module.exports = router