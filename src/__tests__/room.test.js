const request = require('supertest');
const app = require('../app');
const Room = require('../models/room.model.js');
const mongoose = require('mongoose');

describe('GET/ rooms list', () => {
  it('should fetch all rooms', async () => {

    await Room.create([
  {
    room_name: 'Room A',
    room_price: 100,
    room_type: 'couple',          
    room_size: '25',
    room_capacity: 2,
    room_description: 'Cozy room with AC',
    room_slug: 'room-a',
    created_by: new mongoose.Types.ObjectId(),          
    allow_pets: true,
    provide_breakfast: false,
    featured_room: false,
    extra_facilities: []
  },
  {
    room_name: 'Room B',
    room_price: 250,
    room_type: 'single',          
    room_size: '50',
    room_capacity: 4,
    room_description: 'Spacious suite with sea view',
    room_slug: 'room-b',
    created_by: new mongoose.Types.ObjectId(),
    allow_pets: false,
    provide_breakfast: true,
    featured_room: true,
    extra_facilities: ['jacuzzi']
  }
])

    const res = await request(app).get('/api/v1/all-rooms-list');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeDefined();
    expect(res.body.result.data.rows.length).toBe(2);
    expect(res.body.result.data.rows[0].room_name).toBe('Room A');
    expect(res.body.result.data.rows[1].room_name).toBe('Room B');

  });
});

