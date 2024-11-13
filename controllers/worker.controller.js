const Worker = require('../models/worker.model')
const Surgery = require('../models/surgery.model')

// helper function to add workers to surgeries table
const addWorkersToSurgeries = async (worker_id, surgery_ids) => {
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
  // get all workers that are not deleted populate surgeries that are not deleted
  Worker.find({ is_deleted: false }).populate({ path: 'surgeries', match: { is_deleted: false } })
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

  // get worker by id that is not deleted populate surgeries that are not deleted
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
    .catch(error => {
      if (error.name === 'CastError') {
        return res.status(404).json({
          message: `Worker with id: ${id} not found`
        })
      }

      return res.status(500).json(error)
    })
}

const readAllByUserId = (req, res) => {
  // get the user id
  const userId = req.user._id

  // get worker by user id that is not deleted populate surgeries that are not deleted
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
  // add the user id to the request body
  const body = {
    ...req.body,
    created_by: req.user._id
  }

  Worker.create(body)
    .then(data => {
      const workerId = data._id

      if(body.surgeries) {
        addWorkersToSurgeries(workerId, body.surgeries)
      }

      return res.status(201).json({
        message: 'Worker created',
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

  // find the worker by id and update using the request body
  // make sure the data is not deleted
  Worker.findByIdAndUpdate(
    { _id: id, is_deleted: false },
    body,
    {
      new: true,
      runValidators: true
    }
  )
    .then(() => {
      // if the body contains surgeries add them to the workers
      if(body.surgeries) {
        addWorkersToSurgeries(id, body.surgeries)
      }

      return res.status(201).json({message: `Updated worker id: ${id}`})
    })
    .catch(error => {
      if (error.name === 'CastError') {
        if (error.kind === 'ObjectId') {
          return res.status(404).json({
            message: `Worker with id: ${id} not found`
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
    .catch(error => {

      if (error.name === 'CastError') {
        return res.status(404).json({
          message: `Worker with id: ${id} not found`
        })
      }

      return res.status(500).json(error)
    })
}

// below is my old hard delete code

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
//     .catch(error => {

//       if (error.name === 'CastError') {
//         return res.status(404).json({
//           message: `Worker with id: ${id} not found`
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