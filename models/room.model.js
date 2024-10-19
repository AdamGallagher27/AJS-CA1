const { Schema, model } = require('mongoose');

const roomSchema = new Schema({
	room_number: {
		type: String,
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
	hospital_id: {
		type: Schema.Types.ObjectId,
		ref: 'Hospital',
		required: [true, 'hospital_id field is required']
	},
}, { timestamps: true });

module.exports = model('Room', roomSchema);