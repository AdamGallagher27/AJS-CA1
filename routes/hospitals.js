const express = require('express')
const router = express.Router()
const { checkUserPermission, userLoggedIn } = require('../middleware/auth')

const {
	readAll,
	readOne,
	createData,
	updateData,
	deleteData
} = require('../controllers/hospital.controller')

router.get('/', userLoggedIn, checkUserPermission('hospitals', 'read'), readAll)
router.get('/:id', userLoggedIn, checkUserPermission('hospitals', 'read'), readOne)
router.post('/', userLoggedIn, checkUserPermission('hospitals', 'create'), createData)
router.put('/:id', userLoggedIn, checkUserPermission('hospitals', 'update'), updateData)
router.delete('/:id', userLoggedIn, checkUserPermission('hospitals', 'delete'), deleteData)

module.exports = router