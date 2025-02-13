
// Instead of useing try & catch in our async functions its better to wrap it in below codes
module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next)
            .catch(next)  // equals => fn(req, res, next).catch(err => next(err))
    }
};