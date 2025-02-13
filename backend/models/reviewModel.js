const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
const User = require('./userModel')
const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review cannot be empty!']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },

        createdAt: {
            type: Date,
            default: Date.now
        },

        tour: {
            // Parent refering
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour']
        },
        user: {
            // Parent refering
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user']
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.pre(/^find/, function (next) {

    this
        // .populate({
        //     // Only shows name of each tour => in each query that starts with 'find' 
        //     path: 'tour',
        //     select: 'name',
        // })
        .populate({
            // Only shows name & photo of each user => in each query that starts with 'find' 
            path: 'user',
            select: 'name photo',
        })
    next()
})

reviewSchema.statics.calAverageRarings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match:
                { tour: tourId }
        },
        {
            $group:
            {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])

    console.log('statts in review model = ', stats)
    // "stats" have a list of contain one object 
    // Therefore for taking ratingsAverage we need to write like below & save it to our specific Tour
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(
            tourId,
            { ratingsQuantity: stats[0].nRating, ratingAverage: stats[0].avgRating }
        )
    } else {
        await Tour.findByIdAndUpdate(
            tourId,
            { ratingsQuantity: 0, ratingAverage: 0 }
        )
    }

}


// "post" middlreware does not access to the 'next' but "pre" does have an access
reviewSchema.post('save', function () {
    // this points to current review
    this.constructor.calAverageRarings(this.tour)
})

// findOneAndUpdate & findOneandDelete
// we want to access the query so we have to use "pre"
reviewSchema.pre(/^findOneAnd/, async function (next) {
    // this.r = await this.findOne()
    // this.r = await this.find()
    this.r = await this.clone().findOne()
    // console.log('review in reviewModel = ', this.r)

    next()
})

reviewSchema.post(/^findOneAnd/, async function () {
    //  this.findOne() => Does not work here, because the query is already executed
    await this.r.constructor.calAverageRarings(this.r.tour)

})


const Review = mongoose.model("Review", reviewSchema)
module.exports = Review