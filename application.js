require('dotenv').config()
const express = require('express')
const app = express()
const { userLoggedIn, checkUserPermission } = require('./middleware/auth.js')
const { loginRequired, makeAdmin } = require('./controllers/user.controller.js')

// Only connect to the database if dev environment
if (process.env.ENVIRONMENT === 'development') {
  const { connect } = require('./config/db')
  connect()
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// open routes
app.use('/api/users', require('./routes/users'))

app.use((req, res, next) => userLoggedIn(req, res, next))

// protected routes
app.use('/api/hospitals', require('./routes/hospitals'))
app.use('/api/rooms', loginRequired, require('./routes/rooms'))
app.use('/api/surgeries', loginRequired, require('./routes/surgeries'))
app.use('/api/patients', loginRequired, require('./routes/patients'))
app.use('/api/workers', loginRequired, require('./routes/workers'))

// this was originally in the users routes file but had to be moved here for user authenticaiton
app.put('/api/makeAdmin', loginRequired, checkUserPermission('users', 'makeAdmin'), makeAdmin)

module.exports = app