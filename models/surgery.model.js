const { Schema, model } = require('mongoose')

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
  room: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room id field is required']
  },
  patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
  },
  workers: [{
    type: Schema.Types.ObjectId,
    ref: 'Worker',
    required: [true, 'Worker field is required']
  }],
	created_by: {
		type: String,
		required: [true, 'created by field is required']
	},
  is_deleted: {
		type: Boolean,
		required: false,
		default: false
	}
}, { timestamps: true })

// sanitization middleware
surgerySchema.pre('save', function(next) {

	const removeSpecialChars = (str) => {
			return str.replace(/[<>\/\\&%$#@!^*()+=~`|{}[\]:"']/g, '') 
	}

	this.surgery_type = removeSpecialChars(this.surgery_type)

	next()
})

module.exports = model('Surgery', surgerySchema)