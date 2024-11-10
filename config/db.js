require('dotenv').config()
const mongoose = require('mongoose')
let db

const connect = async () => {
	db = null

	try {
		mongoose.set('strictQuery', false)

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
