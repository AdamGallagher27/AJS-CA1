const Surgery = require('../models/surgery.model')
const Room = require('../models/room.model')
const Worker = require('../models/worker.model')

const addNewSurgeryToRoom = async (model, room_id, surgery_id) => {
  try {
    await model.findByIdAndUpdate(room_id, { $push: { surgeries: surgery_id } })
  }
  catch (error) {
    console.error(error)
  }
}

const addWorkerstoSurgery = async (surgery_id, worker_ids) => {
  try {
    await Worker.updateMany(
      { _id: { $in: worker_ids } },
      { $addToSet: { surgeries: surgery_id } }
    )
  }
  catch (error) {
    console.error(error)
  }
}

const readAll = (req, res) => {
  Surgery.find({ is_deleted: false })
    .populate({ path: 'patient', match: { is_deleted: false } })
    .populate({ path: 'room', match: { is_deleted: false } })
    .populate({ path: 'workers', match: { is_deleted: false } })
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
    .populate({ path: 'patient', match: { is_deleted: false } })
    .populate({ path: 'room', match: { is_deleted: false } })
    .populate({ path: 'workers', match: { is_deleted: false } })
    .then(data => {
      if (!data || data.is_deleted) {
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
      if (err.name === 'CastError') {
        return res.status(404).json({
          message: `Surgery with id: ${id} not found`
        })
      }

      return res.status(500).json(err)
    })
}

const readAllByUserId = (req, res) => {
  const userId = req.user._id

  Surgery.find({ created_by: userId, is_deleted: false })
    .populate({ path: 'patient', match: { is_deleted: false } })
    .populate({ path: 'room', match: { is_deleted: false } })
    .populate({ path: 'workers', match: { is_deleted: false } })
    .then(data => {
      if (!data || data.length === 0) {
        return res.status(404).json({
          message: `No Surgeries found for user with id: ${userId}`
        })
      }

      return res.status(200).json({
        message: `Surgery created by user: ${userId}`,
        data
      })
    })
    .catch(error => {
      if (error.name === 'CastError') {
        return res.status(404).json({
          message: `Invalid user ID: ${userId}`,
        })
      }

      return res.status(500).json(err)
    })
}

const createData = (req, res) => {
  const body = {
    ...req.body,
    created_by: req.user._id
  }
  let surgeryId = ''

  Surgery.create(body)
    .then(data => {
      surgeryId = data._id
      addNewSurgeryToRoom(Room, body.room._id, surgeryId)

      if (body.workers) {
        addWorkerstoSurgery(surgeryId, body.workers)
      }

      return res.status(201).json({
        message: "Surgery created",
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

  Surgery.findByIdAndUpdate(
    { _id: id, is_deleted: false },
    body,
    {
      new: true,
      runValidators: true
    }
  )
    .then(data => {
      if (!data) {
        return res.status(404).json({
          message: `Surgery with id: ${id} not found`
        })
      }

      if (body.workers) {
        addWorkerstoSurgery(data._id, body.workers)
      }

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
  const body = { is_deleted: true }

  Surgery.findByIdAndUpdate(id, body)
    .then(async data => {
      if (!data) {
        return res.status(404).json({
          message: `Surgery with id: ${id} not found`
        })
      }
      return res.status(200).json({
        message: `Surgery with id: ${id} deleted`,
        data: data
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

// const deleteSurgeryFromRoom = async (model, room_id, surgery_id) => {
//   try {
//     await model.findByIdAndUpdate(
//       room_id,
//       { $pull: { surgerys: surgery_id } },
//     )
//   }
//   catch (error) {
//     console.error(error)
//   }
// }

// const deleteData = (req, res) => {
//   const id = req.params.id

//   Surgery.findByIdAndDelete(id)
//     .then(async data => {
//       if (!data) {
//         return res.status(404).json({
//           message: `Surgery with id: ${id} not found`
//         })
//       }

//       deleteSurgeryFromRoom(Room, data.room._id, data._id)

//       return res.status(200).json({
//         message: `Surgery with id: ${id}`
//       })
//     })
//     .catch(err => {

//       if (err.name === 'CastError') {
//         return res.status(404).json({
//           message: `Surgery with id: ${id} not found`
//         })
//       }

//       return res.status(500).json(err)
//     })
// }

module.exports = {
  readAll,
  readOne,
  readAllByUserId,
  createData,
  updateData,
  deleteData
}