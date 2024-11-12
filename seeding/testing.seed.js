require('dotenv').config()
const { connect, disconnect } = require('../config/db')
const Hospital = require('../models/hospital.model')
const Patient = require('../models/patient.model')
const Room = require('../models/room.model')
const Surgery = require('../models/surgery.model')
const Worker = require('../models/worker.model')
const User = require('../models/user.model')

const seedDatabase = async () => {
  try {

    await connect()

    await Hospital.deleteMany({})
    await Patient.deleteMany({})
    await Room.deleteMany({})
    await Surgery.deleteMany({})
    await Worker.deleteMany({})
    await User.deleteMany({})

    const user = await User.create({
      full_name: 'Admin User',
      email: 'admin@test.com',
      password: 'password',
      role: 'admin'
    })

    const userId = user._id

    const hospital = await Hospital.create({
      title: 'Central City Hospital',
      city: 'Springfield',
      daily_rate: 1500,
      number_of_departments: 10,
      has_emergency_services: true,
      created_by: userId
    })

    const rooms = await Room.create([
      {
        room_number: 101,
        room_type: "ICU",
        availability_status: true,
        daily_rate: 300,
        hospital: hospital._id,
        created_by: userId
      },
      {
        room_number: 102,
        room_type: "ICU",
        availability_status: false,
        daily_rate: 200,
        hospital: hospital._id,
        created_by: userId
      }
    ])

    // add the rooms to the hospital rooms property for 1:M relationship
    hospital.rooms = rooms.map(room => room._id)
    await hospital.save()

    const workers = await Worker.create([
      {
        worker_role: "doctor",
        first_name: "Alice",
        last_name: "Johnson",
        created_by: userId
      },
      {
        worker_role: "nurse",
        first_name: "Brian",
        last_name: "Smith",
        created_by: userId
      },
      {
        worker_role: "surgeon",
        first_name: "Claire",
        last_name: "Lee",
        created_by: userId
      },
    ])

    const patients = await Patient.create([{
      first_name: "Steve",
      last_name: "Doe",
      insurance: true,
      age: 45,
      condition: "Appendicitis",
      created_by: userId
    },
    {
      first_name: "John",
      last_name: "Doe",
      insurance: false,
      age: 21,
      condition: "Leg break",
      created_by: userId
    }])

    const surgeries = await Surgery.create([{
      surgery_type: "Appendectomy",
      date: new Date("2024-12-15T10:00:00Z"),
      duration: 2,
      room: rooms[0]._id,
      patient: patients[0]._id,
      created_by: userId
    },
    {
      surgery_type: "Appendectomy",
      date: new Date("2024-11-15T10:00:00Z"),
      duration: 1,
      room: rooms[1]._id,
      patient: patients[1]._id,
      created_by: userId
    }])

    // add surgeries to patients
    patients[0].surgeries.push(surgeries[0]._id)
    patients[1].surgeries.push(surgeries[1]._id)
    await patients[0].save()
    await patients[1].save()

    // add surgeries to rooms
    rooms[0].surgeries.push(surgeries[0]._id)
    rooms[1].surgeries.push(surgeries[1]._id)
    await rooms[0].save()
    await rooms[1].save()

    // add surgeries to rooms
    workers[0].surgeries.push(surgeries[0]._id, surgeries[1]._id)
    workers[1].surgeries.push(surgeries[0]._id)
    workers[2].surgeries.push(surgeries[1]._id)
    await workers[0].save()
    await workers[1].save()
    await workers[2].save()

    // add workesr to surgeries
    // surgeries[0].workers.push(workers[0]._id, workers[1]._id) 
    surgeries[0].workers.push(workers[1]._id)
    surgeries[0].workers.push(workers[0]._id)
    surgeries[1].workers.push(workers[2]._id)
    surgeries[1].workers.push(workers[0]._id)
    await surgeries[0].save()
    await surgeries[1].save()


    console.log('Database seeded successfully')
  }
  catch (error) {
    console.error(error)
  }
}

seedDatabase().then(() => disconnect())