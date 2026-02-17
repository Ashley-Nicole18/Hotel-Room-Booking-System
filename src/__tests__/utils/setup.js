const {clearDatabase, connectTestDB, disconnectTestDB } = require('./db');

beforeAll(async () => {
    await connectTestDB();
})

beforeEach(async () => {
    await clearDatabase();
})

afterAll(async () => {
    await disconnectTestDB();
})
