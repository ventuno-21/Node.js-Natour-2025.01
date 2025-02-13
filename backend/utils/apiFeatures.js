class APIFeatures {
    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    filter() {
        const queryObj = { ...this.queryString }
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach(field => delete queryObj[field])

        // Advance filtering
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`)
        // console.log('queryStr:::::', JSON.parse(queryStr))

        this.query = this.query.find(JSON.parse(queryStr))
        // let query = Tour.find(JSON.parse(queryStr))

        return this
    }

    sort() {
        if (this.queryString.sort) {
            // const sortBy = req.query.sort.split(',').map(sort => sort.split(' '));
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        } else {
            this.query = this.query.sort('-createdAt')
        }
        return this
    }
    limit() {
        if (this.queryString.fields) {
            // example: 127.0.0.1:3000/api/v1/tours?sort=price&fields=name,duration
            const fields = this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fields)
        } else {
            // excluding field name "__v"
            this.query = this.query.select('-__v')
        }
        return this
    }
    paginate() {
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 100
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)

        // if (this.queryString.page) {
        //     const numTours = await Tour.countDocuments()
        //     if (skip >= numTours) {
        //         throw new Error('This page does not exist!')
        //     }
        // }
        return this
    }
}

module.exports = APIFeatures;