const express = require('express')
const passport = require('passport')
const bcrypt = require('bcryptjs')
const router = express.Router()
const User = require('../../models/user')


router.get('/login', (req, res) => {
  res.render('login')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login'
}))

router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  const errors = []

  if (!name || !email || !password || !confirmPassword) {
    errors.push({ message: 'All fields are required!' })
  }
  if (password !== confirmPassword) {
    errors.push({ message: 'Passwords are not similar' })
  }
  if (errors.length) {
    return res.render('register', {
      errors, name, email, password, confirmPassword
    })
  }
  
  return User.findOne({ email })
    .then(user => {
      if (user) {
        errors.push({ message: 'Email already exists' })
        res.render('register', {
          errors, name, email, password, confirmPassword
        })
      } 
      return bcrypt.genSalt(10) // 產生「鹽」，並設定複雜度係數為 10
        .then(salt => bcrypt.hash(password, salt)) // 為使用者密碼「加鹽」，產生雜湊值
        .then(hash => {
          // 用雜湊值取代原本的使用者密碼
          return User.create({ name, email, password: hash }) 
            .then(() => res.redirect('/'))
            .catch(err => console.log(err))
        })
    })
})

router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', 'You have successfully logout.')
  res.redirect('/users/login')
})


module.exports = router