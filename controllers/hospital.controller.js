const Hospital = require('../models/hospital.model')
const Room = require('../models/room.model')

const readAll = (req, res) => {
  Hospital.find().populate('rooms')
    .then(data => {

      if (data.length > 0) {
        return res.status(200).json(data)
      }
      else {
        return res.status(404).json('None found')
      }
    })
    .catch(err => {
      console.log(err)
      return res.status(500).json(err)
    })
}

const readOne = (req, res) => {
  const id = req.params.id

  Hospital.findById(id).populate('rooms')
    .then(data => {
      if (!data) {
        return res.status(404).json({
          message: `Hospital with id: ${id} not found`
        })
      }

      return res.status(200).json({
        message: `Hospital with id: ${id} retrieved`,
        data
      })
    })
    .catch(err => {

      if (err.name === 'CastError') {
        return res.status(404).json({
          message: `Hospital with id: ${id} not found`
        })
      }

      return res.status(500).json(err)
    })
}

const createData = (req, res) => {
  const body = req.body

  Hospital.create(body)
    .then(data => {

      return res.status(201).json({
        message: "Hospital created",
        data
      })
    })
    .catch(err => {

      if (err.name === 'ValidationError') {
        return res.status(422).json(err)
      }

      return res.status(500).json(err)
    })
}

const updateData = (req, res) => {
  const id = req.params.id
  const body = req.body

  Hospital.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true
  })
    .then(data => {
      return res.status(201).json(data)
    })
    .catch(err => {

      if (err.name === 'CastError') {

        if (err.kind === 'ObjectId') {
          return res.status(404).json({
            message: `Hospital with id: ${id} not found`
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
  Hospital.findByIdAndDelete(id)
    .then(async data => {
      if (!data) {
        return res.status(404).json({
          message: `Hospital with id: ${id} not found`
        })
      }

      if (data.rooms.length > 0) {
        await Room.deleteMany({ _id: { $in: data.rooms } })
      }

      return res.status(200).json({
        message: `Hospital with id: ${id} deleted`
      })
    })
    .catch(err => {

      if (err.name === 'CastError') {
        return res.status(404).json({
          message: `Hospital with id: ${id} not found`
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