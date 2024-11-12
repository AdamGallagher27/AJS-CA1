const app = require('../application')
const { connect, disconnect } = require('../config/db')
const request = require('supertest')
const User = require('../models/user.model')
const jwt = require('jsonwebtoken')

let token
let roomId
let roomNumber
let userId

beforeAll(async () => {
  await connect()

  const user = await User.findOne({
    email: 'admin@test.com'
  })

  userId = user._id

  token = jwt.sign({
    email: user.email,
    name: user.name,
    _id: userId,
    role: user.role
  }, process.env.JWT_SECRET)

})

afterAll(async () => {
  await disconnect()
}) 

describe('get all rooms', () => {
  test('should retrieve an array of rooms', async () => {
    const res = await request(app).get('/api/rooms').set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(2)

    roomId = res.body[0]._id
    roomNumber = res.body[0].room_number
  })
})


describe('get a single room', () => {
  test('should retrieve a single room', async () => {
    const res = await request(app).get(`/api/rooms/${roomId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.room_number).toEqual(roomNumber)
  })
})

describe('get rooms the admin created', () => {
  test('should retrieve an array of rooms', async () => {
    const res = await request(app).get(`/api/rooms/myRooms/read`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.some(item => item.room_number === 101)).toBe(true)
  })
})

describe('create and retrieve a room', () => {
  let newRoomId

  test('should create a new room', async () => {
    const newRoom = {
      room_number: 103,
      room_type: 'Recovery',
      availability_status: true,
      daily_rate: 250,
      hospital: '672a8d389247e5a1dc998c45',
      created_by: userId
    }
    const res = await request(app).post('/api/rooms').send(newRoom).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(201)

    newRoomId = res.body.data._id
  })

  test('should retrieve the new room', async () => {
    const res = await request(app).get(`/api/rooms/${newRoomId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.room_number).toEqual(103)
  })
})

describe('update and retrieve a room', () => {

  test('should update a new room', async () => {
    const updatedRoom = {
      room_number: 200,
    }
    const res = await request(app).put(`/api/rooms/${roomId}`).send(updatedRoom).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(201)
  })

  test('should retrieve the new room', async () => {
    const res = await request(app).get(`/api/rooms/${roomId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.room_number).toEqual(200)
  })
})

describe('create and then delete the room', () => {

  let roomToBeDeletedId

  test('should create a new room', async () => {
    const newRoom = {
      room_number: 105,
      room_type: 'ICU',
      availability_status: true,
      daily_rate: 300,
      hospital: '672a8d389247e5a1dc998c45',
      created_by: userId
    }

    const res = await request(app).post('/api/rooms').send(newRoom).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(201)

    roomToBeDeletedId = res.body.data._id
  })

  test('should retrieve the new room', async () => {
    const res = await request(app).get(`/api/rooms/${roomToBeDeletedId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.room_number).toEqual(105)
  })

  test('should delete the new room', async () => {
    const res = await request(app).delete(`/api/rooms/${roomToBeDeletedId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.is_deleted).toEqual(false)
  })

  test('should not retrieve the new room', async () => {
    const res = await request(app).get(`/api/rooms/${roomToBeDeletedId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(404)
  })
})