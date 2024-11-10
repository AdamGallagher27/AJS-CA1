const app = require('../application')
const { connect, disconnect } = require('../config/db')
const request = require('supertest')
const User = require('../models/user.model')
const jwt = require('jsonwebtoken')

let token

beforeAll(async () => {
  await connect()

  const user = await User.findOne({
    email: 'admin@test.com'
  })

  token = jwt.sign({
    email: user.email,
    name:user.name,
    _id: user._id,
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
  })
})