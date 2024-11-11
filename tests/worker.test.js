const app = require('../application')
const { connect, disconnect } = require('../config/db')
const request = require('supertest')
const User = require('../models/user.model')
const jwt = require('jsonwebtoken')

let token
let workerId
let workerName
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

describe('get all workers', () => {
  test('should getrieve an array of workers', async () => {
    const res = await request(app).get('/api/workers').set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(3)

    workerId = res.body[0]._id
    workerName = res.body[0].first_name
  })
})

describe('get a single worker', () => {
  test('should retrieve a single worker', async () => {
    const res = await request(app).get(`/api/workers/${workerId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.first_name).toEqual(workerName)
  })
})

describe('get workers the admin created', () => {
  test('should retrieve an array of workers', async () => {
    const res = await request(app).get(`/api/workers/myWorkers/read`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.some(item => item.first_name === workerName)).toBe(true)
  })
})

describe('create and retrieve a worker', () => {
  let newWorkerId

  test('should create a new worker', async () => {
    const newWorker = {
      worker_role: 'nurse',
      first_name: 'Sean',
      last_name: 'Seanson',
      created_by: userId
    }
    const res = await request(app).post('/api/workers').send(newWorker).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(201)

    newWorkerId = res.body.data._id
  })

  test('should retrieve the new worker', async () => {
    const res = await request(app).get(`/api/workers/${newWorkerId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.worker_role).toEqual('nurse')
  })
})

describe('update and retrieve a worker', () => {

  test('should update a new worker', async () => {
    const updatedWorker = {
      worker_role: 'doctor',
    }
    const res = await request(app).put(`/api/workers/${workerId}`).send(updatedWorker).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(201)
  })

  test('should retrieve the new surgery', async () => {
    const res = await request(app).get(`/api/workers/${workerId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.worker_role).toEqual('doctor')
  })
})