const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
const User = require('./userModel')


// this. =>  Always points to current query  

const tourSchema = new mongoose.Schema({
    name: {
        type: String, trim: true, unique: true,
        required: [true, 'A tour must have a name'],
        maxlength: [70, 'A tour name must have less or equal than 40 characters'],
        minlength: [10, 'A tour name must have more or equal than 10 characters'],
        // validate: [validator.isAlpha, 'Tour name must only contain charactors']
    },
    slug: String,
    duration: { type: Number, required: [true, 'A tour must have a duration'] },
    maxGroupSize: { type: Number, required: [true, 'A tour must have a group size'] },
    difficulty: {
        type: String, required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'hard'], message: 'Difficulty is either:easy, medium or hard'
        }
    },
    summary: { type: String, trim: true },
    description: { type: String, trim: true, required: [true, 'A tour must have a description'] },
    ratingsAverage: { type: Number, default: 4.5, min: [1, 'Rating must be above 1.0'], max: [5, 'Rating must be less 5.0'] },
    ratingsQuantity: { type: Number, default: 0 },
    category: { type: String },
    imageCover: { type: String, required: [true, 'A tour must have an image cover'] },
    images: [String],
    rating: { type: Number, min: 1, max: 5 },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                // this only points to current doc on New document creation
                return val < this.price // 100<200 => true
            },
            message: 'Discount price ({VALUE}) should be less than regular price'
        }
    },
    createdAt: { type: Date, default: Date.now },
    startDates: [Date],
    startLocation: {
        // GeoJson
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,

    },
    locations: [{
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
    }],
    // Child referencing
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ],
    // instead of below linew we use virtual referencing population
    // child referncing
    // reviews: [
    //     {
    //         type: mongoose.Schema.ObjectId,
    //         ref: 'Review'
    //     }
    // ],
    secretTour: { type: Boolean, default: false }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

// 1 => ordering ascending
// -1 +> ordering descending
tourSchema.index({ slug: 1 })
// For GEOSPATIAL we can use 2D sphere
tourSchema.index({ startLocation: '2dsphere' })
// Because we use two fields for indexing, now they are compound
tourSchema.index({ price: 1, ratingAverage: -1 })



// virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

// virtual property
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7
})


// 1) Document middleware/hook in mongoose run only before save() & .create() .validate() & .remove()
// save() middleware is not gonna work for sth like .insertMany() or update ...
// this is without slug and in post hook we can see slug is added
tourSchema.pre('save', function (next) {
    // console.log('this =', this)
    this.slug = slugify(this.name, { lower: true })
    next()
})

tourSchema.pre('save', async function (next) {
    const guidesPromises = this.guides.map(async id => User.findById(id))
    this.guides = await Promise.all(guidesPromises)
    next()
})

tourSchema.pre('save', function (next) {
    console.log('will save document ....')
    next()
})

// slug doesnt exists in pre hook/middleware, but it exist after save() or post hook
tourSchema.post('save', function (doc, next) {
    // console.log('doc=', doc)
    next()
})

// 2) Query mongoose middleware
// only the ones that secretTour=false will be shown
//ne = not equal
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } })
    this.start = Date.now()
    next()
})

// regular expression => everything that start with "find"
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt', //  these two fields will not be shown in output
    })
    next()
})

tourSchema.post(/^find/, function (docs, next) {
    console.log((`Query took ${Date.now() - this.start} milliseconds ...`))
    // console.log('post query middleware/hook=', docs)
    next()
})

// Aggregation middleware
// Because geoNear should be the first in aggregation pipeline, and below codes doesnt allow that
// we commented below lines
// tourSchema.pre('aggregate', function (next) {
//     console.log('aggregate this =', this)
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
//     console.log('pipline in tour model = ', this.pipeline)
//     next()
// })


const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour