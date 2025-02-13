const Tour = require('../models/tourModel')
const User = require('../models/userModel')
const Review = require('../models/reviewModel')
const AppError = require('../utils/appError')
const Booking = require('../models/bookingModel')

exports.getOverview = async (req, res, next) => {
    try {
        const tours = await Tour.find()

        res
            .status(200)
            .render('overview', { title: 'All Tours', tours: tours })

    } catch (error) {
        res
            .status(400)
            .render('overview', { title: 'All Tours', tours: tours })
    }
}

exports.getTour = async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    })

    if (!tour) {
        return next(new AppError('There is no tour with that name!', 404))
    }
    res
        .status(200)
        .render('tour', { tour: tour, title: `${tour.name}` })
}

exports.getLoginForm = async (req, res, next) => {
    try {
        // console.log('inside try of getloginform function in viewcontroller ')
        res
            .status(200)
            .render('login', { title: 'Login' })
    } catch (error) {
        console.log('error inside viewsController for login function = ', error.message)
        res
            .status(400)
            // .json({ error: error.message })
            .render('login', { error: error.message })
    }
}


exports.getSignupForm = async (req, res, next) => {
    try {
        // console.log('inside try of getloginform function in viewcontroller ')
        res
            .status(200)
            .render('signup', { title: 'signup' })
    } catch (error) {
        console.log('error inside viewsController for signup function = ', error.message)
        res
            .status(400)
            // .json({ error: error.message })
            .render('signup', { error: error.message })
    }
}


exports.getAccount = (req, res) => {
    res
        .status(200)
        .render('account', { title: 'Your account' })
}


exports.updateUserData = async (req, res, next) => {
    try {
        // console.log('req.body === ', req.body)
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { name: req.body.name, email: req.body.email },
            { new: true, runValidators: true }
        )
        res
            .status(200)
            .render('account', { title: 'Your account', user: updatedUser })

    } catch (error) {
        console.log('error inside updatdtedUserData = ', error.message)
        res
            .status(400)
            .render('account')
    }
}

exports.getMyTours = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
        const tourIds = bookings.map(el => el.tour)
        const tours = await Tour.find({ _id: { $in: tourIds } })

        res
            .status(200)
            .render('overview', { title: 'My Tours', tours })

    } catch (error) {
        console.log(error)

    }
}