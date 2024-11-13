const Hospital = require('../models/hospital.model')

const readAll = (req, res) => {
  // find all hospitals and populate rooms field
  Hospital.find({ is_deleted: false }).populate({ path: 'rooms', match: { is_deleted: false } })
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
  // get the requested hospital id from the params
  const id = req.params.id

  // find the hospital with the id and populate rooms
  // check whether the populated rooms is deleted if they are do not add them to the populated filed
  Hospital.findById(id).populate({ path: 'rooms', match: { is_deleted: false } })
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
    .catch(error => {
      if (error.name === 'CastError') {
        return res.status(404).json({
          message: `Hospital with id: ${id} not found`
        })
      }

      return res.status(500).json(error)
    })
}

// get hospitals that the user created
const readAllByUserId = (req, res) => {
  // get the user id from the request
  const userId = req.user._id

  // find hospitals created by the user populate rooms
  Hospital.find({ created_by: userId, is_deleted: false }).populate({ path: 'rooms', match: { is_deleted: false } })
    .then(data => {
      if (!data || data.length === 0) {
        return res.status(404).json({
          message: `No hospitals found for user with id: ${userId}`
        })
      }

      return res.status(200).json({
        message: `Hospitals created by user: ${userId}`,
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
        message: 'Hospital created',
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
  // get the hospital id and the request body
  const id = req.params.id
  const body = req.body

  // find the hospital and update
  Hospital.findByIdAndUpdate(
    { _id: id, is_deleted: false },
    body,
    {
      new: true,
      runValidators: true
    }
  )
    .then(data => {

      // check if the data exists if not return 404 error
      if (!data) {
        return res.status(404).json({
          message: `No hospitals found with id: ${id}`
        })
      }

      return res.status(201).json(data)
    })
    .catch(error => {

      // if (error.name === 'CastError') {

      //   if (error.kind === 'ObjectId') {
      //     return res.status(404).json({
      //       message: `Hospital with id: ${id} not found`
      //     })
      //   }
      //   else {
      //     return res.status(422).json(error)
      //   }

      // }
      
      console.log(error)

      return res.status(500).json(error)
    })

}

// I originally had a hard delete but switched it out for a soft delete
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
    .catch(error => {

      if (error.name === 'CastError') {
        return res.status(404).json({
          message: `Hospital with id: ${id} not found`
        })
      }

      return res.status(500).json(error)
    })
}

// below was my old hard delete code

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
//     .catch(error => {

//       if (error.name === 'CastError') {
//         return res.status(404).json({
//           message: `Hospital with id: ${id} not found`
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