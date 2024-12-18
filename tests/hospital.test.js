const app = require('../application')
const { connect, disconnect } = require('../config/db')
const request = require('supertest')
const User = require('../models/user.model')
const jwt = require('jsonwebtoken')

let token
let hospitalId
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


describe('get all hospitals', () => {
  test('should getrieve an array of hospitals', async () => {
    const res = await request(app).get('/api/hospitals')
    expect(res.statusCode).toEqual(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(1)

    hospitalId = res.body[0]._id
  })
})

describe('get a single hospital', () => {
  test('should retrieve a single hospital', async () => {
    const res = await request(app).get(`/api/hospitals/${hospitalId}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.title).toEqual('Central City Hospital')
  })
})

describe('get hospitals the admin created', () => {
  test('should retrieve an array of hospitals', async () => {
    const res = await request(app).get(`/api/hospitals/myHospitals/read`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data[0].title).toEqual('Central City Hospital')
  })
})

describe('create and retrieve a hospital', () => {

  let newHospitalId

  test('should create a new hospital', async () => {

    // this used to be sent in the request but it cannot be sent like this with multipart form data
    // const newHospital = {
    //   title: 'Dublin Hospital',
    //   city: 'Dublin',
    //   daily_rate: 1500,
    //   number_of_departments: 10,
    //   has_emergency_services: true,
    //   created_by: userId
    // }

    // this is how you send multipart data
    const res = await request(app).post('/api/hospitals')
      .field('title', 'Dublin Hospital')
      .field('city', 'Dublin')
      .field('daily_rate', 1500)
      .field('number_of_departments', 10)
      .field('has_emergency_services', true)
      .set('Authorization', `Bearer ${token}`)

    console.log(res.text)

    expect(res.statusCode).toEqual(201)

    newHospitalId = res.body.data._id
  })

  test('should retrieve the new hospital', async () => {
    const res = await request(app).get(`/api/hospitals/${newHospitalId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.title).toEqual('Dublin Hospital')
  })
})

describe('update and retrieve a hospital', () => {

  test('should create a new hospital', async () => {

    // same as above this needs to be multipart not json
    // const updatedHospital = {
    //   title: 'Updated name for hospital',
    // }

    const res = await request(app).put(`/api/hospitals/${hospitalId}`).field('title', 'Updated name for hospital').set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(201)
  })

  test('should retrieve the new hospital', async () => {
    const res = await request(app).get(`/api/hospitals/${hospitalId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.title).toEqual('Updated name for hospital')
  })
})

describe('create and then delete the hospital', () => {

  let hospitalToBeDeletedId

  test('should create a new hospital', async () => {
    const res = await request(app).post('/api/hospitals')
      .field('title', 'Delete me')
      .field('city', 'Dublin')
      .field('daily_rate', 1500)
      .field('number_of_departments', 10)
      .field('has_emergency_services', true)
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(201)

    hospitalToBeDeletedId = res.body.data._id
  })

  test('should retrieve the new hospital', async () => {
    const res = await request(app).get(`/api/hospitals/${hospitalToBeDeletedId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.title).toEqual('Delete me')
  })

  test('should delete the new hospital', async () => {
    const res = await request(app).delete(`/api/hospitals/${hospitalToBeDeletedId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.is_deleted).toEqual(false)
  })

  test('should not retrieve the new hospital', async () => {
    const res = await request(app).get(`/api/hospitals/${hospitalToBeDeletedId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(404)
  })
})