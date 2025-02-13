const mongoose = require('mongoose')


const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        requires: [true, 'Booking must belong to a Tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        requires: [true, 'Booking must belong to a User']
    },
    price: {
        type: Number,
        requires: [true, 'Booking must have a price']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
})


bookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({ path: 'tour', select: 'name' })
    next()
})


const Booking = mongoose.model('Booking', bookingSchema)


module.exports = Booking