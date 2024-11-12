const { Schema, model } = require('mongoose');

const patientSchema = new Schema({
	first_name: {
		type: String,
		required: [true, 'First name field is required']
	},
	last_name: {
		type: String,
		required: [true, 'Last name field is required']
	},
	insurance: {
		type: Boolean,
		required: [true, 'Insurance field is required']
	},
	age: {
		type: Number,
		required: [true, 'Age field is required']
	},
  condition: {
		type: String,
		required: [true, 'Condition field is required']
	},
	surgeries: [{
		type: Schema.Types.ObjectId,
		ref: 'Surgery',
		required: [true, 'Surgeries field is required']
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
}, { timestamps: true });

module.exports = model('Patient', patientSchema);