const express = require('express')
const reviewController = require('./../controllers/reviewController')
const authController = require('./../controllers/authController')

// because we put mergeParams in below true & wrote below line in 'tourRoutes":
// => tourRoutes => router.use('/:tourId/reviews', reviewRouter)
// => then below address will be recal same function
// => POST: tours/:tourId/reviews = POST: /reviews (it should be POST method)
const router = express.Router({ mergeParams: true })

// Because middlrewares are run in sequence,
// Threfore all routes after below middleware are protected
router.use(authController.protect)

router.route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview)

router.route('/:id')
    .delete(reviewController.deleteReview)
    .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
    .get(reviewController.getReview)
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview)


module.exports = router
