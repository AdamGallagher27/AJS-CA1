const { Schema, model } = require('mongoose')

const roomSchema = new Schema({
	room_number: {
		type: Number,
		required: [true, 'Title field is required']
	},
	room_type: {
		type: String,
		required: [true, 'City field is required']
	},
	availability_status: {
		type: Boolean,
		required: [true, 'Daily Rate field is required']
	},
	daily_rate: {
		type: Number,
		required: [true, 'Number of departments field is required']
	},
	hospital: {
		type: Schema.Types.ObjectId,
		ref: 'Hospital',
		required: [true, 'hospital field is required']
	},
	surgeries: [{
		type: Schema.Types.ObjectId,
		ref: 'Surgery',
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
	}
}, { timestamps: true })

// sanitization middleware
roomSchema.pre('save', function(next) {

	const removeSpecialChars = (str) => {
			return str.replace(/[<>\/\\&%$#@!^*()+=~`|{}[\]:"']/g, '') 
	}

	this.room_type = removeSpecialChars(this.room_type)

	next()
})

module.exports = model('Room', roomSchema)