const Surgery = require('../models/surgery.model')
const Room = require('../models/room.model')
const Worker = require('../models/worker.model')

// helper function to add new surgery to room table
const addNewSurgeryToRoom = async (model, room_id, surgery_id) => {
  try {
    await model.findByIdAndUpdate(room_id, { $push: { surgeries: surgery_id } })
  }
  catch (error) {
    console.error(error)
  }
}

// helper function to add surgeries to workers table
const addSurgerytoWorkers = async (surgery_id, worker_ids) => {
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
  // find surgeries that are not deleted and populate patient room and workers also make sure they are not deleted
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
    .catch(error => {
      return res.status(500).json(error)
    })

}

const readOne = (req, res) => {
  const id = req.params.id

  // find one surgery by id thats not deleted and populate patient room and workers also make sure they are not deleted
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
    .catch(error => {
      if (error.name === 'CastError') {
        return res.status(404).json({
          message: `Surgery with id: ${id} not found`
        })
      }

      return res.status(500).json(error)
    })
}

const readAllByUserId = (req, res) => {
  const userId = req.user._id

  // find surgeries that are not deleted and the user created using the user id
  //  and populate patient room and workers also make sure they are not deleted
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

      return res.status(500).json(error)
    })
}

const createData = (req, res) => {
  // add user id to the request body
  const body = {
    ...req.body,
    created_by: req.user._id
  }
  let surgeryId = ''

  // create a new surgery to the body
  Surgery.create(body)
    .then(data => {
      surgeryId = data._id

      // add the new surgery to the room table
      addNewSurgeryToRoom(Room, body.room._id, surgeryId)

      // if workers are included in the body update workers table with this surgery
      if (body.workers) {
        addSurgerytoWorkers(surgeryId, body.workers)
      }

      return res.status(201).json({
        message: 'Surgery created',
        data
      })
    })
    .catch(error => {
      if (error.name === 'ValidationError') {
        return res.status(422).json(error)
      }

      return res.status(500).json(error)
    })
}

const updateData = (req, res) => {
  const id = req.params.id
  const body = req.body

  // find the requested surgery and update
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

      // if workers are included in the body update workers table with this surgery
      if (body.workers) {
        addSurgerytoWorkers(data._id, body.workers)
      }

      return res.status(201).json(data)
    })
    .catch(error => {

      if (error.name === 'CastError') {
        if (error.kind === 'ObjectId') {
          return res.status(404).json({
            message: `Surgery with id: ${id} not found`
          })
        }
        else {
          return res.status(422).json({
            message: error.message
          })
        }

      }

      return res.status(500).json(error)
    })
}

// below is my soft delete i orignally had hard delete
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
    .catch(error => {

      if (error.name === 'CastError') {
        return res.status(404).json({
          message: `Surgery with id: ${id} not found`
        })
      }

      return res.status(500).json(error)
    })
}

// this is my old hard delete

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
//     .catch(error => {

//       if (error.name === 'CastError') {
//         return res.status(404).json({
//           message: `Surgery with id: ${id} not found`
//         })
//       }

//       return res.status(500).json(error)
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