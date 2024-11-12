const Worker = require('../models/worker.model')
const Surgery = require('../models/surgery.model')


const addSurgerytoWorkers = async (worker_id, surgery_ids) => {
  try {
    await Surgery.updateMany(
      { _id: { $in: surgery_ids } },
      { $addToSet: { workers: worker_id } }
    )
  }
  catch (error) {
    console.error(error)
  }
}

const readAll = (req, res) => {
  Worker.find({ is_deleted: false }).populate({ path: 'surgeries', match: { is_deleted: false } })
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

  Worker.findById(id).populate({ path: 'surgeries', match: { is_deleted: false } })
    .then(data => {
      if (!data || data.is_deleted) {
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

const readAllByUserId = (req, res) => {
  const userId = req.user._id

  Worker.find({ created_by: userId, is_deleted: false }).populate({ path: 'surgeries', match: { is_deleted: false } })
  .then(data => {
    if(!data || data.length === 0) {
      return res.status(404).json({
        message: `No Workers found for user with id: ${userId}`
      })
    }

    return res.status(200).json({
      message: `Worker created by user: ${userId}`,
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
  const body = {
    ...req.body,
    created_by: req.user._id
  }
  let workerId = ''

  Worker.create(body)
    .then(data => {
      workerId = data._id

      if(body.surgeries) {
        addSurgerytoWorkers(workerId, body.surgeries)
      }

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

  Worker.findByIdAndUpdate(
    { _id: id, is_deleted: false },
    body,
    {
      new: true,
      runValidators: true
    }
  )
    .then(data => {

      if(body.surgeries) {
        addSurgerytoWorkers(id, body.surgeries)
      }

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
  const body = { is_deleted: true }

  Worker.findByIdAndUpdate(id, body)
    .then(async data => {
      if (!data) {
        return res.status(404).json({
          message: `Worker with id: ${id} not found`
        })
      }
      return res.status(200).json({
        message: `Worker with id: ${id} deleted`,
        data: data
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

// const deleteData = (req, res) => {
//   const id = req.params.id

//   Worker.findByIdAndDelete(id)
//     .then(async data => {
//       if (!data) {
//         return res.status(404).json({
//           message: `Worker with id: ${id} not found`
//         })
//       }

//       // deleteWorkerFromSurgery(Surgery, data.surgery_id, data._id)

//       return res.status(200).json({
//         message: `Worker with id: ${id}`
//       })
//     })
//     .catch(err => {

//       if (err.name === 'CastError') {
//         return res.status(404).json({
//           message: `Worker with id: ${id} not found`
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