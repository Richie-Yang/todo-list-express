const bcrypt = require('bcryptjs')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const Todo = require('../todo')
const User = require('../user')
const db = require('../../config/mongoose')


const SEED_USER = {
  name: 'root',
  email: 'root@root.com',
  password: '123',
}


db.once('open', () => {
  return bcrypt.genSalt(10)
    .then(salt => bcrypt.hash(SEED_USER.password, salt))
    .then(hash => {
      return User.create({ 
        name: SEED_USER.name, 
        email: SEED_USER.email, 
        password: hash 
      })
    })
    .then(user => {
      const userId = user._id

      return Promise.all(Array.from({ length: 10 }, (_, i) => {
        return Todo.create({ name: `name-${i}`, userId })
      }))
    })
    .then(() => {
      console.log('done')
      process.exit()
    })
    .catch(err => console.log(err))
})
