const Room = require('../models/room.model')
const Hospital = require('../models/hospital.model')

// update hospital table with new room
const addNewRoomToHospital = async (model, hospital_id, room_id) => {
  await model.findByIdAndUpdate(hospital_id, { $push: { rooms: room_id } })
}

const readAll = (req, res) => {
  // find all rooms that are not deleted populate surgeries and hospital fields that are not deleted
  Room.find({ is_deleted: false }).populate({ path: 'surgeries', match: { is_deleted: false } }).populate({ path: 'hospital', match: { is_deleted: false } })
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
  // get room if from route params
  const id = req.params.id

  // using the id get the room and populate the surgeries and hospital fields
  Room.findById(id).populate({ path: 'surgeries', match: { is_deleted: false } }).populate({ path: 'hospital', match: { is_deleted: false } })
    .then(data => {

      // if there is no data or data has been deleted throw a 404 error
      if (!data || data.is_deleted) {
        return res.status(404).json({
          message: `Room with id: ${id} not found`
        })
      }

      return res.status(200).json({
        message: `Room with id: ${id} retrieved`,
        data
      })
    })
    .catch(error => {
      if (error.name === 'CastError') {
        return res.status(404).json({
          message: `Room with id: ${id} not found`
        })
      }

      return res.status(500).json(error)
    })
}

const readAllByUserId = (req, res) => {
  // get user id from the request
  const userId = req.user._id

  // get the room that was created by the user, populate surgeries and hospital fields
  // make sure all fields are not deleted
  Room.find({ created_by: userId, is_deleted: false }).populate({ path: 'surgeries', match: { is_deleted: false } }).populate({ path: 'hospital', match: { is_deleted: false } })
    .then(data => {
      if (!data || data.length === 0) {
        return res.status(404).json({
          message: `No Rooms found for user with id: ${userId}`
        })
      }

      return res.status(200).json({
        message: `Rooms created by user: ${userId}`,
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

  // add the user id to the request body
  const body = {
    ...req.body,
    created_by: req.user._id
  }

  Room.create(body)
    .then(async data => {

      // after creating a new room add the room to the hospital table
      addNewRoomToHospital(Hospital, body.hospital._id, data._id)

      return res.status(201).json({
        message: 'Room created',
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
  // get the room id and the request body
  const id = req.params.id
  const body = req.body

  // find and update the room 
  Room.findByIdAndUpdate(
    { _id: id, is_deleted: false },
    body,
    {
      new: true,
      runValidators: true
    }
  )
    .then(async data => {
      if (!data) {
        return res.status(404).json({
          message: `Room with id: ${id} not found`
        })
      }

      return res.status(201).json(data)
    })
    .catch(error => {
      if (error.name === 'CastError') {
        if (error.kind === 'ObjectId') {
          return res.status(404).json({
            message: `Room with id: ${id} not found`
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

// this is my soft delete i used to have a hard delete

const deleteData = (req, res) => {
  const id = req.params.id
  const body = { is_deleted: true }

  Room.findByIdAndUpdate(id, body)
    .then(async data => {
      if (!data) {
        return res.status(404).json({
          message: `Room with id: ${id} not found`
        })
      }
      return res.status(200).json({
        message: `Room with id: ${id} deleted`,
        data: data
      })
    })
    .catch(error => {

      if (error.name === 'CastError') {
        return res.status(404).json({
          message: `Room with id: ${id} not found`
        })
      }

      return res.status(500).json(error)
    })
}

// this is my old hard delete code

// const deleteRoomFromHospital = async (model, hospital_id, room_id) => {
//   try {
//     await model.findByIdAndUpdate(
//       hospital_id,
//       { $pull: { rooms: room_id } },
//     )
//   }
//   catch (error) {
//     console.error(error)
//   }

// }


// const deleteData = (req, res) => {
//   const id = req.params.id

//   Room.findByIdAndDelete(id)
//     .then(async data => {
//       if (!data) {
//         return res.status(404).json({
//           message: `Room with id: ${id} not found`
//         })
//       }

//       deleteRoomFromHospital(Hospital, data.hospital._id, data._id)

//       return res.status(200).json({
//         message: `Room with id: ${id}`
//       })
//     })
//     .catch(error => {

//       if (error.name === 'CastError') {
//         return res.status(404).json({
//           message: `Room with id: ${id} not found`
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