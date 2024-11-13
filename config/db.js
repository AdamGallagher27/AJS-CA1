// import required libs
require('dotenv').config()
const mongoose = require('mongoose')

// instantiate db variable
let db

// destructure env variables
const { ENVIRONMENT, DB_URL, TEST_DB_URL } = process.env

const connect = async () => {
	db = null

	// try connect to db url
	try {
		mongoose.set('strictQuery', false)

		// if the environment is set to developement use dev url else use test url
		const dbUrl = ENVIRONMENT === 'development' ? DB_URL : TEST_DB_URL
		await mongoose.connect(dbUrl)

		console.log('Connected successfully to db')

		db = mongoose.connection
	} catch (error) {
		console.log(error)
	}
}

const disconnect = async () => {
	await db.close()
}

module.exports = { connect, disconnect }
