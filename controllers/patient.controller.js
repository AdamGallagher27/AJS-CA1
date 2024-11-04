const Patient = require('../models/patient.model')
const Surgery = require('../models/surgery.model')


const addNewPatientToSurgery = async (model, surgery_id, patient_id) => {
  await model.findByIdAndUpdate(surgery_id, { $push: { patients: patient_id } })
}

const deletePatientFromSurgery = async (model, surgery_id, patient_id) => {
  try {
    await model.findByIdAndUpdate(
      surgery_id,
      { $pull: { patients: patient_id } },
    )
  }
  catch (error) {
    console.error(error)
  }

}

const readAll = (req, res) => {
  Patient.find().populate('surgeries')
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

  Patient.findById(id).populate('surgeries')
    .then(data => {
      if (!data) {
        return res.status(404).json({
          message: `Patient with id: ${id} not found`
        })
      }

      return res.status(200).json({
        message: `Patient with id: ${id} retrieved`,
        data
      })
    })
    .catch(err => {
      if (err.name === 'CastError') {
        return res.status(404).json({
          message: `Patient with id: ${id} not found`
        })
      }

      return res.status(500).json(err)
    })
}

const createData = (req, res) => {
  const body = req.body

  Patient.create(body)
    .then(async data => {
      addNewPatientToSurgery(Surgery, body.surgery_id, data._id)

      return res.status(201).json({
        message: "Patient created",
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

  Patient.findByIdAndUpdate(id, body, {
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
            message: `Patient with id: ${id} not found`
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

  Patient.findByIdAndDelete(id)
    .then(async data => {
      if (!data) {
        return res.status(404).json({
          message: `Patient with id: ${id} not found`
        })
      }

      deletePatientFromSurgery(Surgery, data.surgery_id, data._id)

      return res.status(200).json({
        message: `Patient with id: ${id}`
      })
    })
    .catch(err => {

      if (err.name === 'CastError') {
        return res.status(404).json({
          message: `Patient with id: ${id} not found`
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