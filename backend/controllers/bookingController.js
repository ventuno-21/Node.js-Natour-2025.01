const AppError = require('../utils/appError')
const Tour = require('../models/tourModel')
const Booking = require('../models/bookingModel')
const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')
const { fetch } = require('undici')
// const stripe = require('stripe')('sk_test_51PdcEaLtsWoRnmydxpPZFNyLmU9OsujTkR04v9GxS0EJfTqBR0b7xpyRobgDKSqyTigfVXmv81HPH45JnEbYxGvD00qOueVrCh', {
//     apiVersion: '2025-01-27.acacia; custom_checkout_beta=v1;',
// });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20; custom_checkout_beta=v1;',
});

exports.getCheckoutSession = async (req, res) => {
    try {
        // Get currently book tour 
        const tour = await Tour.findById(req.params.tourId)
        // console.log('bookingController/getCheckoutSession/tour.id & name = ', tour.id, tour.name)
        // console.log('bookingController/getCheckoutSession/user = ', req.user.name, req.user.email)


        // create checkout session
        const session = await stripe.checkout.sessions.create({
            customer_email: req.user.email,
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${req.params.tourId
                }&user=${req.user.id}&price=${tour.price}`,
            cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
            client_reference_id: req.params.tourId,
            line_items: [
                {
                    name: `${tour.name} Tour`,
                    description: tour.summary,
                    images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                    amount: tour.price * 100,
                    currency: 'usd',
                    quantity: 1
                }
            ]
        });

        // create session as response
        res.json({
            clientSecret: session.client_secret
        })

    } catch (error) {
        console.log('bookingController/getCheckoutSession/error.message = ', error)

        res.status(400).json({
            status: 'failed',
            message: error.message,
            error
        })
    }
}


exports.createBookingCheckout = async (req, res, next) => {
    try {
        const { tour, user, price } = req.query

        if (!tour && !user && !price) {
            return next()
        }
        await Booking.create({ tour, user, price })

        res.redirect(req.originalUrl.split('?')[0])

    } catch (error) {
        console.log('bookingController/createBookingCheckout/catch error = ', error)
    }
}

exports.createBooking = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBookings = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)