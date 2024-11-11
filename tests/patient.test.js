const app = require('../application')
const { connect, disconnect } = require('../config/db')
const request = require('supertest')
const User = require('../models/user.model')
const jwt = require('jsonwebtoken')

let token
let patientId
let patientName
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

describe('get all patients', () => {
  test('should getrieve an array of patients', async () => {
    const res = await request(app).get('/api/patients').set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(2)

    patientId = res.body[0]._id
    patientName = res.body[0].first_name
  })
})


describe('get a single patient', () => {
  test('should retrieve a single patient', async () => {
    const res = await request(app).get(`/api/patients/${patientId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.first_name).toEqual(patientName)
  })
})

describe('get patients the admin created', () => {
  test('should retrieve an array of patients', async () => {
    const res = await request(app).get(`/api/patients/myPatients/read`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.some(item => item.first_name === 'Steve')).toBe(true)
  })
})

describe('create and retrieve a patient', () => {

  let newpatientId

  test('should create a new patient', async () => {
    const newpatient = {
      first_name: 'Sean',
      last_name: 'Gallagher',
      insurance: true,
      age: 21,
      condition: 'unwell',
      surgeries: [],
    }
    const res = await request(app).post('/api/patients').send(newpatient).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(201)

    newpatientId = res.body.data._id
  })

  test('should retrieve the new patient', async () => {
    const res = await request(app).get(`/api/patients/${newpatientId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.first_name).toEqual('Sean')
  })
})

describe('update and retrieve a patient', () => {

  test('should update a new patient', async () => {
    const updatedPatient = {
      first_name: 'Updated name for patient',
    }
    const res = await request(app).put(`/api/patients/${patientId}`).send(updatedPatient).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(201)
  })

  test('should retrieve the new patient', async () => {
    const res = await request(app).get(`/api/patients/${patientId}`).set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body.data.first_name).toEqual('Updated name for patient')
  })
})