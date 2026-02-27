const {clearDatabase, connectTestDB, disconnectTestDB } = require('./db.util');

beforeAll(async () => {
    await connectTestDB();
})

beforeEach(async () => {
    await clearDatabase();
})

afterAll(async () => {
    await disconnectTestDB();
})

module.exports = {
    connectTestDB,
    clearDatabase,
    disconnectTestDB
}