const Surgery = require('../models/surgery.model')
const Room = require('../models/room.model')

const addNewSurgeryToRoom = async (model, room_id, surgery_id) => {
  await model.findByIdAndUpdate(room_id, { $push: { surgeries: surgery_id } })
}

const deleteSurgeryFromRoom = async (model, room_id, surgery_id) => {
  try {
    await model.findByIdAndUpdate(
      room_id,
      { $pull: { surgerys: surgery_id } },
    )
  }
  catch (error) {
    console.error(error)
  }

}

const readAll = (req, res) => {
  Surgery.find()
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

  Surgery.findById(id)
    .then(data => {
      if (!data) {
        return res.status(404).json({
          message: `Surgery with id: ${id} not found`
        })
      }

      return res.status(200).json({
        message: `Surgery with id: ${id} retrieved`,
        data
      })
    })
    .catch(err => {
      console.log(err)

      if (err.name === 'CastError') {
        return res.status(404).json({
          message: `Surgery with id: ${id} not found`
        })
      }

      return res.status(500).json(err)
    })
}

const createData = (req, res) => {
  console.log('check me ' + JSON.stringify(req.body))
  const body = req.body

  Surgery.create(body)
    .then(async data => {
      console.log(`New surgery created`, data)

      addNewSurgeryToRoom(Room, body.room_id, data._id)

      return res.status(201).json({
        message: "Surgery created",
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

  Surgery.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true
  })
    .then(async data => {
      updateRoomSurgerys(body.room_id, data._id)
      return res.status(201).json(data)
    })
    .catch(err => {

      if (err.name === 'CastError') {
        if (err.kind === 'ObjectId') {
          return res.status(404).json({
            message: `Surgery with id: ${id} not found`
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

  Surgery.findByIdAndDelete(id)
    .then(async data => {
      if (!data) {
        return res.status(404).json({
          message: `Surgery with id: ${id} not found`
        })
      }

      deleteSurgeryFromRoom(Room, data.room_id, data._id)

      return res.status(200).json({
        message: `Surgery with id: ${id}`
      })
    })
    .catch(err => {

      if (err.name === 'CastError') {
        return res.status(404).json({
          message: `Surgery with id: ${id} not found`
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