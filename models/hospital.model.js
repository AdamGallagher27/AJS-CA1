const { Schema, model } = require('mongoose')

const hospitalSchema = new Schema({
	title: {
		type: String,
		required: [true, 'Title field is required']
	},
	city: {
		type: String,
		required: [true, 'City field is required']
	},
	daily_rate: {
		type: Number,
		required: [true, 'Daily Rate field is required']
	},
	number_of_departments: {
		type: Number,
		required: [true, 'Number of departments field is required']
	},
	has_emergency_services: {
		type: Boolean,
		required: [true, 'Has emergency services field is required']
	},
	rooms: [{
		type: Schema.Types.ObjectId,
		ref: 'Room',
		required: true
	}],
	created_by: {
		type: String,
		required: [true, 'created by field is required']
	},
	is_deleted: {
		type: Boolean,
		required: false,
		default: false
	},
	image_path: {
		type: String,
		required: false,
},
}, { timestamps: true })

// sanitization middleware
hospitalSchema.pre('save', function(next) {

	const removeSpecialChars = (str) => {
			return str.replace(/[<>\/\\&%$#@!^*()+=~`|{}[\]:"']/g, '') 
	}

	this.title = removeSpecialChars(this.title)
	this.city = removeSpecialChars(this.city)
	this.created_by = removeSpecialChars(this.created_by)

	next()
})

module.exports = model('Hospital', hospitalSchema)