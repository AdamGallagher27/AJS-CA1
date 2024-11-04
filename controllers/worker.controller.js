const Worker = require('../models/worker.model')
const Surgery = require('../models/surgery.model')


const addNewWorkerToSurgery = async (model, surgery_id, worker_id) => {
  await model.findByIdAndUpdate(surgery_id, { $push: { workers: worker_id } })
}

const deleteWorkerFromSurgery = async (model, surgery_id, worker_id) => {
  try {
    await model.findByIdAndUpdate(
      surgery_id,
      { $pull: { workers: worker_id } },
    )
  }
  catch (error) {
    console.error(error)
  }

}

const readAll = (req, res) => {
  Worker.find().populate('surgeries')
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

  Worker.findById(id).populate('surgeries')
    .then(data => {
      if (!data) {
        return res.status(404).json({
          message: `Worker with id: ${id} not found`
        })
      }

      return res.status(200).json({
        message: `Worker with id: ${id} retrieved`,
        data
      })
    })
    .catch(err => {
      if (err.name === 'CastError') {
        return res.status(404).json({
          message: `Worker with id: ${id} not found`
        })
      }

      return res.status(500).json(err)
    })
}

const createData = (req, res) => {
  const body = req.body

  Worker.create(body)
    .then(async data => {
      addNewWorkerToSurgery(Surgery, body.surgery_id, data._id)

      return res.status(201).json({
        message: "Worker created",
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

  Worker.findByIdAndUpdate(id, body, {
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
            message: `Worker with id: ${id} not found`
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

  Worker.findByIdAndDelete(id)
    .then(async data => {
      if (!data) {
        return res.status(404).json({
          message: `Worker with id: ${id} not found`
        })
      }

      deleteWorkerFromSurgery(Surgery, data.surgery_id, data._id)

      return res.status(200).json({
        message: `Worker with id: ${id}`
      })
    })
    .catch(err => {

      if (err.name === 'CastError') {
        return res.status(404).json({
          message: `Worker with id: ${id} not found`
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