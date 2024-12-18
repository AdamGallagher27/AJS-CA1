const { Schema, model } = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new Schema({
  full_name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'please use a valid email address']
  },
  password: {
    type: String,
    required: true,
    min: 5
  },
  role: {
    type: String, 
    enum: ['user', 'admin'],
    default: 'user'
  }
}, { timestamps: true })

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password, function (result) {
    return result
  })
}

// sanitization middleware
userSchema.pre('save', function(next) {

	const removeSpecialChars = (str) => {
			return str.replace(/[<>\/\\&%$#@!^*()+=~`|{}[\]:"']/g, '') 
	}

  // not sanitizing password as i want them to be able to add special charachters
	this.full_name = removeSpecialChars(this.full_name)

	next()
})

module.exports = model('User', userSchema)