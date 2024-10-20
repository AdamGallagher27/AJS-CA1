const { Schema, model } = require('mongoose');

const surgerySchema = new Schema({
  surgery_type: {
    type: String,
    required: [true, 'Surgery type field is required']
  },
  date: {
    type: Date,
    required: [true, 'Date field is required']
  },
  duration: {
    type: Number,
    required: [true, 'Duration field is required']
  },
  room_id: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room id field is required']
  },
  patient_id: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
  }
}, { timestamps: true });

module.exports = model('Surgery', surgerySchema);