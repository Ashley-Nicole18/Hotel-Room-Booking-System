const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Review = require('../models/review.modal');
const { clearDatabase, connectTestDB, disconnectTestDB } = require('./utils/setup.js');
const User = require('../models/user.model'); 

describe('GET/ room reviews list', () => {
  beforeAll(async () => await connectTestDB());
  beforeEach(async () => await clearDatabase());
  afterAll(async () => await disconnectTestDB());

  it('happy path: should fetch reviews for a room', async () => {
    const mockUser = await User.create({
      userName: 'linda_walker',
      fullName: 'Linda Walker',
      email: 'lindawalker@school.edu',
      password: 'password719',
      phone: '09123456789',
      address: 'Brookshire',
      gender: 'female'
    });

    const roomId = new mongoose.Types.ObjectId();

    await Review.create([
      {
        user_id: mockUser._id,
        room_id: roomId,
        booking_id: new mongoose.Types.ObjectId(),
        rating: 5,
        message: 'Loved the room and service.'
      },
      {
        user_id: mockUser._id,
        room_id: roomId,
        booking_id: new mongoose.Types.ObjectId(),
        rating: 3,
        message: 'Room was fine but noisy.'
      }
    ]);

    const res = await request(app)
    .get(`/api/v1/get-room-reviews-list/${roomId}?limit=10&page=1`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeDefined();
    expect(res.body.result.data.rows.length).toBe(2);
    expect(res.body.result.data.rows[0].message).toBe('Loved the room and service.');
    expect(res.body.result.data.rows[1].message).toBe('Room was fine but noisy.');
  });

  it('sad path: should return 200 with empty list when no reviews exist for a room', async () => {
    const roomId = new mongoose.Types.ObjectId();

  const res = await request(app).get(`/api/v1/get-room-reviews-list/${roomId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeDefined();
    expect(res.body.result.data.rows.length).toBe(0);
  });
});

// test comment