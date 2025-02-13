const Review = require('./../models/reviewModel')
// const catchAsync = require('./../utils/catchAsync')
const factory = require('./handlerFactory')




// Below midlleware will be used for createReview in its route
// Allow nested routes 
exports.setTourUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId
    if (!req.body.user) req.body.user = req.userId

    next()
}
exports.createReview = factory.createOne(Review)
exports.getAllReviews = factory.getAll(Review)
exports.updateReview = factory.updateOne(Review)
exports.getReview = factory.getOne(Review)
exports.deleteReview = factory.deleteOne(Review)



// exports.createReview = async (req, res, next) => {
//     try {
//         // Allow nested routes
//         // ****when we used factory, below two lines are mentioned in middlreware with name:setTourUserIds
//         // ****Then the middlreware name is added to route of this function
//         if (!req.body.tour) req.body.tour = req.params.tourId
//         if (!req.body.user) req.body.user = req.userId
//         const newReview = await Review.create(req.body)

//         res
//             .status(201)
//             .json({
//                 status: 'success',
//                 data: {
//                     newReview
//                 }
//             })

//     } catch (error) {
//         res
//             .status(400)
//             .json({
//                 status: 'fail',
//                 message: error.message
//             })

//     }
// }



// exports.getAllReviews = async (req, res, next) => {
//     try {
//         let filter = {}
//         if (req.params.tourId) filter = { tour: req.params.tourId }
//         console.log('filtered reviews based on tour ===', filter)
//         const reviews = await Review.find(filter)

//         res
//             .status(200)
//             .json({
//                 status: 'success',
//                 data: {
//                     results: reviews.length,
//                     reviews
//                 }
//             })

//     } catch (error) {
//         res
//             .status(404)
//             .json({
//                 status: 'fail',
//                 message: error.message
//             })

//     }
// }