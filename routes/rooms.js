const express = require('express')
const router = express.Router()
const { checkUserPermission, userLoggedIn } = require('../middleware/auth')

const {
	readAll,
	readOne,
	createData,
	updateData,
	deleteData
} = require('../controllers/room.controller')

router.get('/', userLoggedIn, checkUserPermission('rooms', 'read'), readAll)
router.get('/:id', userLoggedIn, checkUserPermission('rooms', 'read'), readOne)
router.post('/', userLoggedIn, checkUserPermission('rooms', 'create'), createData)
router.put('/:id', userLoggedIn, checkUserPermission('rooms', 'update'), updateData)
router.delete('/:id', userLoggedIn, checkUserPermission('rooms', 'delete'), deleteData)

module.exports = router