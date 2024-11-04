const Room = require('../models/room.model')
const Hospital = require('../models/hospital.model')


const addNewRoomToHospital = async (model, hospital_id, room_id) => {
  await model.findByIdAndUpdate(hospital_id, { $push: { rooms: room_id } })
}

const deleteRoomFromHospital = async (model, hospital_id, room_id) => {
  try {
    await model.findByIdAndUpdate(
      hospital_id,
      { $pull: { rooms: room_id } },
    )
  }
  catch (error) {
    console.error(error)
  }

}

const readAll = (req, res) => {
  Room.find().populate('surgeries hospital')
    .then(data => {

      if (data.length > 0) {
        return res.status(200).json(data)
      }
      else {
        return res.status(404).json('None found')
      }
    })
    .catch(err => {
      return res.status(500).json(err)
    })
}

const readOne = (req, res) => {
  const id = req.params.id

  Room.findById(id).populate('surgeries hospital')
    .then(data => {
      if (!data) {
        return res.status(404).json({
          message: `Room with id: ${id} not found`
        })
      }

      return res.status(200).json({
        message: `Room with id: ${id} retrieved`,
        data
      })
    })
    .catch(err => {
      console.log(err)

      if (err.name === 'CastError') {
        return res.status(404).json({
          message: `Room with id: ${id} not found`
        })
      }

      return res.status(500).json(err)
    })
}

const createData = (req, res) => {
  console.log('check me ' + JSON.stringify(req.body))
  const body = req.body

  Room.create(body)
    .then(async data => {
      console.log(`New room created`, data)

      addNewRoomToHospital(Hospital, body.hospital._id, data._id)

      return res.status(201).json({
        message: "Room created",
        data
      })
    })
    .catch(err => {
      console.log(err)

      if (err.name === 'ValidationError') {
        return res.status(422).json(err)
      }

      return res.status(500).json(err)
    })
}

const updateData = (req, res) => {
  const id = req.params.id
  const body = req.body

  Room.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true
  })
    .then(async data => {
      return res.status(201).json(data)
    })
    .catch(err => {
      if (err.name === 'CastError') {
        if (err.kind === 'ObjectId') {
          return res.status(404).json({
            message: `Room with id: ${id} not found`
          })
        }
        else {
          return res.status(422).json({
            message: err.message
          })
        }

      }
      return res.status(500).json(err)
    })
}

const deleteData = (req, res) => {
  const id = req.params.id

  Room.findByIdAndDelete(id)
    .then(async data => {
      if (!data) {
        return res.status(404).json({
          message: `Room with id: ${id} not found`
        })
      }

      deleteRoomFromHospital(Hospital, data.hospital._id, data._id)

      return res.status(200).json({
        message: `Room with id: ${id}`
      })
    })
    .catch(err => {

      if (err.name === 'CastError') {
        return res.status(404).json({
          message: `Room with id: ${id} not found`
        })
      }

      return res.status(500).json(err)
    })
}

module.exports = {
  readAll,
  readOne,
  createData,
  updateData,
  deleteData
}