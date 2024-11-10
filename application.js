require('dotenv').config()
const express = require('express')
const app = express()
const { userLoggedIn } = require('./middleware/auth.js')
const { loginRequired } = require('./controllers/user.controller.js')
const jwt = require('jsonwebtoken')

console.log('Current environment:', process.env.ENVIRONMENT)

// Only connect to the database if dev environment
if (process.env.ENVIRONMENT === 'development') {
  const { connect } = require('./config/db')
  connect()
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/views/'))

// open routes
app.use('/api/users', require('./routes/users'))

app.use((req, res, next) => userLoggedIn(req, res, next))

// protected routes
app.use('/api/hospitals', require('./routes/hospitals'))
app.use('/api/rooms', loginRequired, require('./routes/rooms'))
app.use('/api/surgeries', loginRequired, require('./routes/surgeries'))
app.use('/api/patients', loginRequired, require('./routes/patients'))
app.use('/api/workers', loginRequired, require('./routes/workers'))

module.exports = app