const appError = require('./../utils/appError')
const APIFeatures = require('./../utils/apiFeatures')


exports.getAll = Model => async (req, res, next) => {
    try {
        // To allow for nested GET reviews on tour
        // only will be used below two lines for REVIEW
        let filter = {}
        if (req.params.tourId) filter = { tour: req.params.tourId }
        console.log('filtered reviews based on tour ===', filter)

        // console.log('req.query::::', req.query)

        const features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limit()
            .paginate()

        // Execute query
        const docs = await features.query
        // const docs = await features.query.explain()

        res
            .status(200)
            .json({
                status: 'success',
                requesteAt: req.requestTime,
                results: docs.length,
                data: { data: docs }
            })

    } catch (error) {
        res
            .status(400)
            .json({
                status: 'failed',
                message: error.message
            })
    }

}


exports.deleteOne = Model => async (req, res, next) => {
    try {
        const doc = await Model.findByIdAndDelete(req.params.id)

        if (!doc) {
            return next(new appError('No document found with that id', 404))
        }

        res
            .status(204)
            .json({ status: 'success', data: null })

    } catch (error) {
        res
            .status(400)
            .json({ message: error.message, error })
    }
}


exports.updateOne = Model => async (req, res, next) => {

    try {
        const document = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        if (!document) {
            return next(new appError('No document found with that id', 404))
        }
        res
            .status(200)
            .json({
                status: 'success',
                data: { document: document }
            })

    } catch (error) {
        res
            .status(400)
            .json({
                status: 'failed',
                message: error.message,
                error

            })
    }
}

exports.createOne = Model => async (req, res, next) => {
    try {
        const Document = await Model.create(req.body);

        res
            .status(201)
            .json({
                status: 'success',
                data: { Document: Document }
            })
    } catch (error) {
        res
            .status(400)
            .json({
                status: 'failed',
                message: error.message
            })
    }
}

exports.getOne = (Model, populateOptions) => async (req, res, next) => {
    try {
        let query = Model.findById(req.params.id)
        if (populateOptions) query = Model.findById(req.params.id).populate('reviews')
        const doc = await query
        // const tour = await Tour.findById(req.params.id).populate({
        //     path: 'guides',
        //     select: '-__v -passwordChangedAt', //  these two fields will not be shown in output
        // }) // Because we use query middleware in tourModel now we remove populate therefore can be used everywhere
        // = Tour.findOne({ _id: req.params.id }) without populate

        if (!doc) {
            return next(new appError('No tour found with that id', 404))
        }

        res
            .status(200)
            .json({
                status: 'success',
                data: { doc: doc }
            })

    } catch (error) {
        res
            .status(400)
            .json({
                status: 'failed',
                message: error.message
            })
    }
}


