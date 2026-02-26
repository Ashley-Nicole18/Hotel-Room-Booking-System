jest.mock('../models/room.model.js');
jest.mock('../models/booking.model.js');
jest.mock('../middleware/app.authentication', () => ({
  isAuthenticatedUser: (req, res, next) => {
    req.user = { _id: '64f1a2b3c4d5e6f7a8b9c0d1' }; 
    next();
  },
  isBlocked: (req, res, next) => next(),
  isAdmin: (req, res, next) => next(),
  isRefreshTokenValid: (req, res, next) => next(), 
}));

const Room = require('../models/room.model.js');
const Booking = require('../models/booking.model.js');
const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app/index.js')

describe('place booking order', () => {

    beforeEach(() => {
        jest.clearAllMocks();   
    })

    it('should place booking order successfully', async () => {
    const roomId = new mongoose.Types.ObjectId().toHexString();
    const userId = new mongoose.Types.ObjectId().toHexString(); 

    Room.findById.mockResolvedValue({
        _id: roomId, 
        room_status: 'available',
        save: jest.fn().mockResolvedValue(true)
    });

    Booking.create.mockResolvedValue({ 
        _id: new mongoose.Types.ObjectId().toHexString(), 
        room_id: roomId, 
        booking_by: userId
    });

    const res = await request(app)
        .post(`/api/v1/placed-booking-order/${roomId}`)
        .send({ 
            booking_dates: ['2026-03-02'],
        });


    expect(res.statusCode).toBe(201);
    expect(res.body.result.message).toContain('successful');
});

    it('should fail for invalid room ID format', async () => {

    const res = await request(app)
      .post(`/api/v1/placed-booking-order/invalid-id`) 
      .send({ booking_dates: ['2026-03-01'] });


    expect(res.statusCode).toBe(400);
    console.log(res.body)
    

    expect(res.body.result.error).toBeDefined();
    expect(res.body.result.error).toContain('Something went wrong');
});

    it('should fail when room does not exist', async () => {
    const roomId = new mongoose.Types.ObjectId().toHexString();
    
    Room.findById.mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/v1/placed-booking-order/${roomId}`)
      .send({ booking_dates: ['2026-03-01'] });

    expect(res.statusCode).toBe(404); 

    expect(res.body.result.error).toBeDefined();
    expect(res.body.result.error.toLowerCase()).toContain('room');
    expect(res.body.result.error.toLowerCase()).toContain('not exist');
});

    it('Edge Case: should fail when room is already booked', async () => {
    const roomId = new mongoose.Types.ObjectId().toHexString();

    Room.findById.mockResolvedValue({ 
        _id: roomId, 
        room_status: 'booked' 
    });

    const res = await request(app)
      .post(`/api/v1/placed-booking-order/${roomId}`)
      .send({ booking_dates: ['2026-03-01'] });

    expect(res.statusCode).toBe(400); 
    
    expect(res.body.result.error).toBeDefined();
    expect(res.body.result.error.toLowerCase()).toContain('already booked');
});
})

