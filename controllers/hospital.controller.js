const Hospital = require('../models/hospital.model')

// destructure env variables
const { MY_AWS_BUCKET, IMAGE_URL, MY_AWS_ACCESS_KEY_ID, MY_AWS_REGION, MY_AWS_SECRET_ACCESS_KEY } = process.env

// delete image from s3 bucket
const deleteImage = async (filename) => {
  const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3')

  // create a s3 client
  const s3 = new S3Client({
    region: MY_AWS_REGION,
    credentials: {
      accessKeyId: MY_AWS_ACCESS_KEY_ID,
      secretAccessKey: MY_AWS_SECRET_ACCESS_KEY
    }
  })

  try {
    // send the delete command to the s3 bucket
    const data = await s3.send(new DeleteObjectCommand({
      Bucket: MY_AWS_BUCKET,
      Key: filename
    }))

    console.log('Object deleted', data)

  } catch (error) {
    console.error(error)
  }

}


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

      // if image path is found add the aws url to it
      if (data.image_path) {
        data.image_path = IMAGE_URL + data.image_path
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
  let body = {
    ...req.body,
    created_by: req.user._id
  }

  // if image file is truthy assign the key (file name) to the body image path
  if (req?.files) {
    body.image_path = req.files[0].key
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
  // get the image file from req.files
  const imageFile = req?.files[0]
  // get the hospital id and the request body
  const id = req.params.id
  let body = req.body
  
  // if image file is truthy assign the key (file name) to the body image path
  if (imageFile) {
    body.image_path = imageFile.key
  }

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

      if (data.image_path) {
        deleteImage(data.image_path)
      }
      
      return res.status(201).json(data)
    })
    .catch(error => {

      if (error.name === 'CastError') {

        if (error.kind === 'ObjectId') {
          return res.status(404).json({
            message: `Hospital with id: ${id} not found`
          })
        }
        else {
          return res.status(422).json(error)
        }

      }

      return res.status(500).json(error)
    })

}

// I originally had a hard delete but switched it out for a soft delete
const deleteData = (req, res) => {
  const id = req.params.id
  const body = { is_deleted: true }

  Hospital.findByIdAndUpdate(id, body)
    .then(data => {
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