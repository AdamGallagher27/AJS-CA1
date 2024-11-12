const Patient = require('../models/patient.model')
const Surgery = require('../models/surgery.model')

// helper function to add the created patient to its related surgery table
const addNewPatientToSurgery = async (model, surgery_id, patient_id) => {
  await model.findByIdAndUpdate(surgery_id, { $push: { patients: patient_id } })
}


const readAll = (req, res) => {
  // get all patients that are not deleted and populate surgeries that are also not deleted
  Patient.find({ is_deleted: false }).populate({ path: 'surgeries', match: { is_deleted: false } })
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
  // get patient id from route params
  const id = req.params.id

  // get the patient with the id and populate surgeries
  Patient.findById(id).populate({ path: 'surgeries', match: { is_deleted: false } })
    .then(data => {

      // if data is underfined or deleted through a 404 error
      if (!data || data.is_deleted) {
        return res.status(404).json({
          message: `Patient with id: ${id} not found`
        })
      }

      return res.status(200).json({
        message: `Patient with id: ${id} retrieved`,
        data
      })
    })
    .catch(error => {
      if (error.name === 'CastError') {
        return res.status(404).json({
          message: `Patient with id: ${id} not found`
        })
      }

      return res.status(500).json(error)
    })
}

const readAllByUserId = (req, res) => {
  // get user id from request
  const userId = req.user._id

  // get the patient that was created by the user thats not deleted
  // populate surgies field if its not deleted
  Patient.find({created_by: userId,  is_deleted: false}).populate({ path: 'surgeries', match: { is_deleted: false } })
  .then(data => {
    if(!data || data.length === 0) {
      return res.status(404).json({
        message: `No Patients found for user with id: ${userId}`
      })
    }

    return res.status(200).json({
      message: `Patients created by user: ${userId}`,
      data
    })
  })
  .catch(error => {
    if(error.name === 'CastError') {
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

  // use the body to create a new surgery
  Patient.create(body)
    .then(async data => {

      // add the newly created patient to the surgery table
      addNewPatientToSurgery(Surgery, body.surgery_id, data._id)

      return res.status(201).json({
        message: 'Patient created',
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

  // get the user id and the updated body
  const id = req.params.id
  const body = req.body

  // find the patient and update
  Patient.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true
  })
    .then(async data => {

      // check that the patient they are trying to update is not deleted
      if(data.is_deleted) {
        return res.status(404).json({
          message: `No hospitals found for user with id: ${userId}`
        })
      }

      return res.status(201).json(data)
    })
    .catch(error => {

      if (error.name === 'CastError') {
        if (error.kind === 'ObjectId') {
          return res.status(404).json({
            message: `Patient with id: ${id} not found`
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

// I originally had a hard delete but switched it out for a soft delete
const deleteData = (req, res) => {
  const id = req.params.id
  const body = { is_deleted: true }

  Patient.findByIdAndUpdate(id, body)
    .then(async data => {
      if (!data) {
        return res.status(404).json({
          message: `Patient with id: ${id} not found`
        })
      }
      return res.status(200).json({
        message: `Patient with id: ${id} deleted`,
        data: data
      })
    })
    .catch(error => {

      if (error.name === 'CastError') {
        return res.status(404).json({
          message: `Patient with id: ${id} not found`
        })
      }

      return res.status(500).json(error)
    })
}

// below was my old hard delete code

// const deletePatientFromSurgery = async (model, surgery_id, patient_id) => {
//   try {
//     await model.findByIdAndUpdate(
//       surgery_id,
//       { $pull: { patients: patient_id } },
//     )
//   }
//   catch (error) {
//     console.error(error)
//   }

// }

// const deleteData = (req, res) => {
//   const id = req.params.id

//   Patient.findByIdAndDelete(id)
//     .then(async data => {
//       if (!data) {
//         return res.status(404).json({
//           message: `Patient with id: ${id} not found`
//         })
//       }

//       deletePatientFromSurgery(Surgery, data.surgery_id, data._id)

//       return res.status(200).json({
//         message: `Patient with id: ${id}`
//       })
//     })
//     .catch(error => {

//       if (error.name === 'CastError') {
//         return res.status(404).json({
//           message: `Patient with id: ${id} not found`
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