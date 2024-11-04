const { Schema, model } = require('mongoose')

const workerSchema = new Schema({
  worker_role: {
    type: String,
    enum: [
      'doctor',
      'nurse',
      'surgeon'
    ],
    required: [true, 'Worker role field is required']
  },
  first_name: {
    type: String,
    required: [true, 'First name field is required']
  },
  last_name: {
    type: String,
    required: [true, 'Last name field is required']
  },
  surgeries: [{
    type: Schema.Types.ObjectId,
    ref: 'Surgery',
    required: false
  }],
}, { timestamps: true })

module.exports = model('Worker', workerSchema)