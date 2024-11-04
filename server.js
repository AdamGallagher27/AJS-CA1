const express = require('express')
const app = express()
const port = 5000

require('dotenv').config()
require('./config/db.js')()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/views/'))

// open routes
app.use('/api/users', require('./routes/users'))

// protected routes
app.use('/api/hospitals', require('./routes/hospitals'))
app.use('/api/rooms', require('./routes/rooms'))
app.use('/api/surgeries', require('./routes/surgeries'))
app.use('/api/patients', require('./routes/patients'))

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
});
