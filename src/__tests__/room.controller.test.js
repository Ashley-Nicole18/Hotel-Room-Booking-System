const request = require('supertest');
const app = require('../app/index.js');
const Room = require('../models/room.model.js');
const mongoose = require('mongoose')
const MyQueryHelper = require('../configs/api.feature.js');

jest.mock('../models/room.model.js');
jest.mock('../configs/api.feature.js');


describe('get all rooms list (mocked)', () => {

  it('should return all rooms successfully', async() => {
    const mockRooms = [{
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
  }]

  Room.find.mockResolvedValue(mockRooms);

  MyQueryHelper.mockImplementation(() => ({
    search: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    paginate: jest.fn().mockReturnThis(),
    query: Promise.resolve(mockRooms)
  }));

  const res = await request(app).get('/api/v1/all-rooms-list');

  expect(res.statusCode).toEqual(200);
  expect(res.body.result.data.rows.length).toBe(2);
  })

  it('should return 500 if DB throws an error', async () => {
    Room.find.mockRejectedValue(new Error('DB failure'));

    const res = await request(app).get('/api/v1/all-rooms-list');

    expect(res.statusCode).toBe(500);
    expect(res.body.status).toBe('SERVER SIDE ERROR');
    expect(res.body.message).toContain('DB failure');
  })

  it('should return 200 with empty rooms if no room exists', async () => {
    Room.find.mockResolvedValue([]);

    MyQueryHelper.mockImplementation(() => ({
    search: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    paginate: jest.fn().mockReturnThis(),
    query: Promise.resolve([])
  }));

    const res = await request(app).get('/api/v1/all-rooms-list');

    expect(res.statusCode).toEqual(200);
    expect(res.body.result.data.total_rows).toBe(0);
    expect(res.body.result.data.rows.length).toEqual(0)
  })
});

describe('getRoomByIdOrSlugName Controller', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const BASE_URL = '/api/v1/get-room-by-id-or-slug-name'; 

  it('should find a room by a valid 24-character MongoDB ID', async () => {
    const validMongoId = '507f1f77bcf86cd799439011'; 
    
    const mockRoom = { 
      _id: validMongoId, 
      room_name: 'Test Room',
      room_images: [],
      created_by: { 
        _id: 'u1', 
        userName: 'tester',
        fullName: 'Test User',
        email: 'test@test.com',
        phone: '123',
        avatar: '/a.png',
        gender: 'male',
        role: 'admin'
      }
    };
    
    Room.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockRoom)
    });

    const res = await request(app).get(`${BASE_URL}/${validMongoId}`); 

    expect(res.statusCode).toBe(200);
    expect(res.body.result.data.id).toBe(validMongoId);
  });

  it('should find a room by Slug if the string is NOT a 24-char ID', async () => {
    const slug = 'luxury-ocean-view';
    
    const mockRoom = { 
      _id: 'some-id', 
      room_slug: slug, 
      room_images: [],
      created_by: { _id: 'u1', avatar: '/a.png' } 
    };

    Room.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockRoom)
    });

    const res = await request(app).get(`${BASE_URL}/${slug}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.result.data.room_slug).toBe(slug);
  });

  it('should return 404 if the room is not found in DB', async () => {
    Room.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null)
    });

    const res = await request(app).get(`${BASE_URL}/random-slug`);

    expect(res.statusCode).toBe(404);
    expect(res.body.result.error).toBe('Room does not exist');
  });
});