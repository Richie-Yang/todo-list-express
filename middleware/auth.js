module.exports = {
  authenticator: (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.flash('warning_msg', 'Content access requires user login!')
      return res.redirect('/users/login')
    }
    return next()
  }
}