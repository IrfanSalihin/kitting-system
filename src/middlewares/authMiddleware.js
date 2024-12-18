exports.ensureLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        return res.status(403).send('You must be logged in to access this page.');
    }
    next();
};
