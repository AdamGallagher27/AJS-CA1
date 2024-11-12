const Hospital = require('../models/hospital.model')

const readAll = (req, res) => {
  // find all hospitals and populate rooms field
  Hospital.find({ is_deleted: false }).populate('rooms')
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
  // get the requested hospital id from the params
  const id = req.params.id

  // find the hospital with the id and populate rooms
  Hospital.findById(id).populate('rooms')
    .then(data => {
      if (!data || data.is_deleted) {
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

// get hospitals that the user created
const readAllByUserId = (req, res) => {
  // get the user id from the request
  const userId = req.user._id

  // find hospitals created by the user populate rooms
  Hospital.find({ created_by: userId, is_deleted: false }).populate('rooms')
    .then(data => {
      if (!data || data.length === 0) {
        return res.status(404).json({
          message: `No hospitals found for user with id: ${userId}`
        })
      }

      return res.status(200).json({
        message: `Hosptils created by user: ${userId}`,
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
  // get the new hospital body
  const body = {
    ...req.body,
    created_by: req.user._id
  }

  // create with the the request body
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

  Hospital.findByIdAndUpdate(
    { _id: id, isDeleted: false },
    body,
    {
      new: true,
      runValidators: true
    }
  )
    .then(data => {
      if (!data) {
        return res.status(404).json({
          message: `No hospitals found for user with id: ${userId}`
        })
      }

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

// const deleteData = (req, res) => {
//   const id = req.params.id
//   Hospital.findByIdAndDelete(id)
//     .then(async data => {
//       if (!data) {
//         return res.status(404).json({
//           message: `Hospital with id: ${id} not found`
//         })
//       }

//       if (data.rooms.length > 0) {
//         await Room.deleteMany({ _id: { $in: data.rooms } })
//       }

//       return res.status(200).json({
//         message: `Hospital with id: ${id} deleted`
//       })
//     })
//     .catch(err => {

//       if (err.name === 'CastError') {
//         return res.status(404).json({
//           message: `Hospital with id: ${id} not found`
//         })
//       }

//       return res.status(500).json(err)
//     })
// }

// const makeAdmin = (req, res, next) => {

//   const userId = req.query.userId
//   const body = { role: 'admin' }

//   if (!userId) {
//     return res.status(404).json({
//       message: `Invalid user id`
//     })
//   }

//   User.findByIdAndUpdate(userId, body, {
//     new: true,
//     runValidators: true
//   })
//     .then(() => {
//       return res.status(201).json({ message: `User: ${userId} has admin role` })
//     })
//     .catch(error => {

//       if (error.name === 'CastError') {
//         return res.status(404).json({
//           message: `No user found with id: ${userId}`
//         })
//       }

//       return res.status(500).json(error)
//     })
// }


const deleteData = (req, res) => {
  const id = req.params.id
  const body = { is_deleted: true }

  Hospital.findByIdAndUpdate(id, body)
    .then(async data => {
      if (!data) {
        return res.status(404).json({
          message: `Hospital with id: ${id} not found`
        })
      }
      return res.status(200).json({
        message: `Hospital with id: ${id} deleted`,
        data: data
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
  readAllByUserId,
  createData,
  updateData,
  deleteData
}