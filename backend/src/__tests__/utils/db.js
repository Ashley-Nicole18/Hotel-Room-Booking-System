const mongoose = require('mongoose');
const Room = require('../../models/room.model.js');

async function clearDatabase() {
	const collections = Object.keys(mongoose.connection.collections);

	for (const collectionName of collections) {
		const collection = mongoose.connection.collections[collectionName]

		try {
			await collection.deleteMany({});
		} catch (err) {
			console.error(`Failed to clear collection ${collectionName}:`, err);
		}
	}
}

async function connectTestDB() {
	if (!process.env.MONGO_URI_TEST) {
		throw new Error('MONGO_URI_TEST environment variable not set');
	}
	await mongoose.connect(process.env.MONGO_URI_TEST);
}

async function disconnectTestDB() {
	await mongoose.connection.close();
}

module.exports = {clearDatabase, connectTestDB, disconnectTestDB};