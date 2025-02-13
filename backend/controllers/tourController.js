// const fs = require('fs')
const AppError = require('../utils/appError')
const Tour = require('./../models/tourModel')
const APIFeatures = require('./../utils/apiFeatures')
const catchAsync = require('./../utils/catchAsync')
const factory = require('./handlerFactory')
const multer = require('multer')
const sharp = require('sharp')



// we use memoryStorage instead of diskstorage=>
// therefore we will be able to user buffer
const multerStorage = multer.memoryStorage()

// only upload image type not other files
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        // first argument of cb function is error, if it is null it means no error
        cb(null, true)
    } else {
        cb(new AppError('Not an image, please upload only images!', 400), false)
    }
}

// const upload = multer({ dest: 'public/img/users' })
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

// When there is only one picture to upload use as below: 'single'
// upload.single('image')
// When there are more than one picture to upload use as below: 'array'
// upload.array('images', 5)
// When there are one picture for one specific field in model,
//  & multiple picture for another field in model, then 'fields' should be used
exports.uploadTourImages = upload.fields(
    [
        //maxCount:1 => req.file => imageCover field in User model only 1 images will accept
        { name: 'imageCover', maxCount: 1 },
        //maxCount:3 => req.fiels=> images field in User model only 3 images will accept
        { name: 'images', maxCount: 3 }
    ]
)

exports.resizeTourImages = async (req, res, next) => {
    console.log('tourController/resizeTourImages/req.files=', req.files)
    if (!req.files.imageCover || !req.files.images) return next()

    // 1) Cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`

    await sharp(req.files.imageCover[0].buffer)
        .resize(1000, 750)
        .toFormat('jpeg')
        .jpeg({ quality: 60 })
        .toFile(`public/img/tours/${req.body.imageCover}`)

    // 2) Images
    req.body.images = []

    await Promise.all(
        req.files.images.map(async (file, index) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`

            await sharp(file.buffer)
                .resize(1000, 750)
                .toFormat('jpeg')
                .jpeg({ quality: 60 })
                .toFile(`public/img/tours/${filename}`)

            req.body.images.push(filename)
        })
    )
    console.log('tourController/resizeTourImages/ req.body ===', req.body)
    next()
}

// example" 127.0.0.1:3000/api/v1/tours/top-5-cheap
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingAverage,price'
    req.query.fields = 'name, price, ratingAverage, summary, difficulty'

    next()
}




exports.getTourStats = catchAsync(async (req, res, next) => {

    const stats = await Tour.aggregate([
        {
            $match: { ratingAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                // _id: '$ratingAverage',
                numTours: { $sum: 1 },
                numRating: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        },
        {
            // ne=not equal
            $match: { _id: { $ne: 'EASY' } }
        }
    ])

    res
        .status(200)
        .json({
            status: 'success',
            data: { status: stats }
        })
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {

    const year = req.params.year * 1

    const plan = await Tour.aggregate([
        {
            // To unwind the startDates array
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                // id will show the number of month, ex january = 01
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            // 0 in project means not to show the fields, 1 means show it
            $project: { _id: 0 }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            // 15 or whatever no we put of document in mongodb will be shown 
            $limit: 15
        }
    ])

    res
        .status(200)
        .json({
            status: 'success',
            requestedYear: year,
            data: { plan: plan }
        })
})


exports.getToursWithin = async (req, res, next) => {
    try {
        const { distance, latlng, unit } = req.params
        const [lat, lng] = latlng.split(',')
        const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1
        if (!lat || !lng) {
            next(new AppError('Please provide latitute and logitude in the format lat & lng ', 400))
        }
        console.log("GEOSpatial distance, lat, lng, unit = ", distance, lat, lng, unit)
        const tours = await Tour.find(
            { startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } }
        )

        res
            .status(200)
            .json({
                status: 'success',
                data: {
                    results: tours.length,
                    data: tours
                }
            })

    } catch (error) {
        res
            .status(400)
            .json({
                status: 'failed',
                data: {
                    message: error.message
                }
            })

    }
}

exports.getDistances = async (req, res, next) => {
    try {
        const { latlng, unit } = req.params
        const [lat, lng] = latlng.split(',')
        const multiplier = unit === 'mi' ? 0.000621371 : 0.001
        if (!lat || !lng) {
            next(new AppError('Please provide latitute and logitude in the format lat & lng ', 400))
        }
        console.log("GEOSpatial lat, lng, unit = ", lat, lng, unit)

        const distances = await Tour.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [lng * 1, lat * 1]
                    },
                    distanceField: 'distance',
                    // convert meters to kilometer
                    distanceMultiplier: multiplier
                }
            },
            {
                $project: {
                    distance: 1,
                    name: 1
                }
            }
        ])

        res
            .status(200)
            .json({
                status: 'success',
                data: {
                    // results: tours.length,
                    data: distances
                }
            })

    } catch (error) {
        res
            .status(400)
            .json({
                status: 'failed',
                data: {
                    message: error.message
                }
            })

    }
}

exports.getAllTours = factory.getAll(Tour)
exports.getTour = factory.getOne(Tour, { path: 'reviews' })
exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour)


// exports.createTour = catchAsync(async (req, res, next) => {
//     const newTour = await Tour.create(req.body);

//     res
//         .status(201)
//         .json({
//             status: 'success',
//             data: { tour: newTour }
//         })
// })


// exports.updateTour = catchAsync(async (req, res, next) => {

//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

//     if (!tour) {
//         return next(new AppError('No tour found with that id', 404))
//     }

//     res
//         .status(200)
//         .json({
//             status: 'success',
//             data: { tour: tour }
//         })
// })

// Model 1 for deleteing a Tour

// Model 2 for deleteing a Tour
// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id)
//     if (!tour) {
//         return next(new AppError('No tour found with that id', 404))
//     }
//     res
//         .status(204)
//         .json({ status: 'success', data: null })
// })

// exports.getTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findById(req.params.id).populate('reviews')
//     // const tour = await Tour.findById(req.params.id).populate({
//     //     path: 'guides',
//     //     select: '-__v -passwordChangedAt', //  these two fields will not be shown in output
//     // }) // Because we use query middleware in tourModel now we remove populate therefore can be used everywhere
//     // = Tour.findOne({ _id: req.params.id }) without populate

//     if (!tour) {
//         return next(new AppError('No tour found with that id', 404))
//     }

//     res
//         .status(200)
//         .json({
//             status: 'success',
//             data: { tour: tour }
//         })
// })

// exports.getAllTours = catchAsync(async (req, res, next) => {

//     // console.log('req.query::::', req.query)

//     const features = new APIFeatures(Tour.find(), req.query)
//         .filter()
//         .sort()
//         .limit()
//         .paginate()

//     // Execute query
//     const tours = await features.query

//     res
//         .status(200)
//         .json({
//             status: 'success',
//             requesteAt: req.requestTime,
//             results: tours.length,
//             data: { tours: tours }
//         })

// })
