const mongoose = require('mongoose');
let db;

const connect = async () => {
	db = null;

	try {
		mongoose.set('strictQuery', false);

		const dbUrl = process.env.ENVIRONMENT === 'testing' ? process.env.TEST_DB_URL : process.env.DB_URL
		await mongoose.connect(dbUrl);

		console.log('Connected successfully to db');
		db = mongoose.connection;
	} catch (error) {
		console.log(error);
	}
	finally {
		if (db !== null && db.readyState === 1) {
			// await db.close();
			// console.log("Disconnected successfully from db");
		}
	}
};

const disconnect = async () => {
	await db.close();
};

module.exports = { connect, disconnect };
