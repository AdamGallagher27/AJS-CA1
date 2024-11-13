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
workerSchema.pre('save', function(next) {

	const removeSpecialChars = (str) => {
			return str.replace(/[<>\/\\&%$#@!^*()+=~`|{}[\]:"']/g, '') 
	}

	this.worker_role = removeSpecialChars(this.worker_role)
	this.first_name = removeSpecialChars(this.first_name)
	this.last_name = removeSpecialChars(this.last_name)

	next()
})

module.exports = model('Worker', workerSchema)