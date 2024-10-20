const { Schema, model } = require('mongoose');

const workerSchema = new Schema({
  worker_role: {
    type: String,
    enum:[
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
    ref: 'Room',
    required: [false, 'Surgeries field is required']
  }],
  // patient_id: {
  //     type: Schema.Types.ObjectId,
  //     ref: 'Patient',
  //     required: true
  // }
}, { timestamps: true });

module.exports = model('Worker', workerSchema);