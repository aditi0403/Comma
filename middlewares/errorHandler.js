const errorHandler = (err, req, res, next) => {
    console.error("Handled by custom error middleware:", err.message);

    res.status(err.status || 500).render('error', {
        title: 'Error',
        error: err.message || 'Something went wrong.',
        user: req.user || null,
        bodyClass: 'd-flex flex-column min-vh-100'
    });
};

module.exports = errorHandler;
