module.exports = {
    isLoggedIn: (req, res, next) => {
console.log(req.session)
        if (req.session.user) {
            return next()
        }
        res.redirect('/')
    }
}