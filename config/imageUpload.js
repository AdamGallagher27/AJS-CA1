const multer = require('multer')
const path = require('path')
const { S3Client } = require('@aws-sdk/client-s3')
const multerS3 = require('multer-s3')

// destructure env variables
const { MY_AWS_REGION, MY_AWS_ACCESS_KEY_ID, MY_AWS_SECRET_ACCESS_KEY, MY_AWS_BUCKET } = process.env

// create a new s3 client
const s3 = new S3Client({
  region: MY_AWS_REGION,
  credentials: {
    accessKeyId: MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: MY_AWS_SECRET_ACCESS_KEY
  }
})

// create a multer s3 storage variable
const storage = multerS3({
  s3: s3,
  bucket: MY_AWS_BUCKET,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
  key: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
})



const fileFilter = (req, file, cb) => {
  if (!file) {
    return cb(null, false)
  }

  else if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Image must be jpg|jpeg|png|gif'), false)
  }
  else {
    return cb(null, true)
  }
}

module.exports = multer({
  fileFilter,
  storage
})