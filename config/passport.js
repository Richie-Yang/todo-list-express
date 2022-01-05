const passport = require('passport')
const bcrypt = require('bcryptjs')
const LocalStrategy = require('passport-local').Strategy
const facebookStrategy = require('passport-facebook').Strategy
const User = require('../models/user')


module.exports = app => {
  // 初始化 Passport 模組
  app.use(passport.initialize())
  app.use(passport.session())

  // 設定本地登入策略
  passport.use(new LocalStrategy(
    { usernameField: 'email', passReqToCallback: true }, 
    (req, email, password, done) => {
      User.findOne({ email })
        .then(user => {
          if (!user) {
            req.flash('warning_msg', 'That email is not registered')
            return done(null, false)
          }
          return bcrypt.compare(password, user.password)
            .then(isMatch => {
              if (!isMatch) {
                req.flash('warning_msg', 'Email or Password incorrect')
                return done(null, false)
              }
              return done(null, user)
            })
        })
        .catch(err => done(err, false))
    }
  ))

  passport.use(new facebookStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK,
    profileFields: ['email', 'displayName']
  }, (accessToken, refreshToken, profile, done) => {
    console.log(profile)
    const { email, name } = profile._json

    return User.findOne({ email })
      .then(user => {
        if (user) return done(null, user)

        const randomPassword = Math.random().toString(36).slice(-8)
        return bcrypt.genSalt(10)
          .then(salt => bcrypt.hash(randomPassword, salt))
          .then(hash => {
            return User.create({ name, email, password: hash })
          })
          .then(user => done(null, user))
          .catch(err => done(err, false))
      })
  }))

  // 設定序列化與反序列化
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .lean()
      .then(user => done(null, user))
      .catch(err => done(err, null))
  })
}