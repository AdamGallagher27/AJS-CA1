const { Schema, model } = require('mongoose');

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
	}]
}, { timestamps: true });

module.exports = model('Room', roomSchema);