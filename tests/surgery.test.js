const app = require('../application')
const { connect, disconnect } = require('../config/db')
const request = require('supertest')
const User = require('../models/user.model')
const jwt = require('jsonwebtoken')

let token
let surgeryId
let surgeryType
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

describe('get all surgeries', () => {
  test('should getrieve an array of surgeries', async () => {
    const res = await request(app).get('/api/surgeries').set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(2)

    surgeryId = res.body[0]._id
    surgeryType = res.body[0].surgery_type
  })
})

describe('get a single surgery', () => {
  test('should retrieve a single surgery', async () => {
    const res = await request(app).get(`/api/surgeries/${surgeryId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.surgery_type).toEqual(surgeryType)
  })
})

describe('get surgeries the admin created', () => {
  test('should retrieve an array of surgeries', async () => {
    const res = await request(app).get(`/api/surgeries/mySurgeries/read`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.some(item => item.surgery_type === "Appendectomy")).toBe(true)
  })
})

describe('create and retrieve a surgery', () => {
  let newSurgeryId

  test('should create a new surgery', async () => {
    const newSurgery = {
      surgery_type: 'Brain Surgery',
      date: new Date('2024-12-15T10:00:00Z'),
      duration: 12,
      room: '672a8d389247e5a1dc998c45',
      patient: '672a8d389247e5a1dc998c45',
      created_by: userId
    }
    const res = await request(app).post('/api/surgeries').send(newSurgery).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(201)

    newSurgeryId = res.body.data._id
  })

  test('should retrieve the new room', async () => {
    const res = await request(app).get(`/api/surgeries/${newSurgeryId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.surgery_type).toEqual('Brain Surgery')
  })
})

describe('update and retrieve a surgery', () => {

  test('should update a new surgery', async () => {
    const updatedSurgery = {
      surgery_type: 'Heart Surgery',
    }
    const res = await request(app).put(`/api/surgeries/${surgeryId}`).send(updatedSurgery).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(201)
  })

  test('should retrieve the new surgery', async () => {
    const res = await request(app).get(`/api/surgeries/${surgeryId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.surgery_type).toEqual('Heart Surgery')
  })
})

describe('create and then delete the surgery', () => {

  let surgeryToBeDeletedId

  test('should create a new surgery', async () => {
    const newSurgery = {
      surgery_type: 'Appendectomy',
      date: new Date('2024-12-15T10:00:00Z'),
      duration: 2,
      room: '672a8d389247e5a1dc998c45',
      patient: '672a8d389247e5a1dc998c45',
      created_by: userId
    }

    const res = await request(app).post('/api/surgeries').send(newSurgery).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(201)

    surgeryToBeDeletedId = res.body.data._id
  })

  test('should retrieve the new surgery', async () => {
    const res = await request(app).get(`/api/surgeries/${surgeryToBeDeletedId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.surgery_type).toEqual('Appendectomy')
  })

  test('should delete the new surgery', async () => {
    const res = await request(app).delete(`/api/surgeries/${surgeryToBeDeletedId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.is_deleted).toEqual(false)
  })

  test('should not retrieve the new surgery', async () => {
    const res = await request(app).get(`/api/surgeries/${surgeryToBeDeletedId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(404)
  })
})