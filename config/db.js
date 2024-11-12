// import required libs
require('dotenv').config()
const mongoose = require('mongoose')

// instantiate db variable
let db

const connect = async () => {
	db = null

	// try connect to db url
	try {
		mongoose.set('strictQuery', false)

		// if the environment is set to developement use dev url else use test url
		const dbUrl = process.env.ENVIRONMENT === 'development' ? process.env.DB_URL : process.env.TEST_DB_URL
		await mongoose.connect(dbUrl)

		console.log('Connected successfully to db ' + dbUrl)
		db = mongoose.connection
	} catch (error) {
		console.log(error)
	}
}

const disconnect = async () => {
	await db.close()
}

module.exports = { connect, disconnect }
