const express = require('express')
const router = express.Router()
const { checkUserPermission, userLoggedIn } = require('../middleware/auth')

const {
	readAll,
	readOne,
	createData,
	updateData,
	deleteData
} = require('../controllers/worker.controller')

router.get('/', userLoggedIn, checkUserPermission('workers', 'read'), readAll)
router.get('/:id', userLoggedIn, checkUserPermission('workers', 'read'), readOne)
router.post('/', userLoggedIn, checkUserPermission('workers', 'create'),  createData)
router.put('/:id', userLoggedIn, checkUserPermission('workers', 'update'), updateData)
router.delete('/:id', userLoggedIn, checkUserPermission('workers', 'delete'), deleteData)

module.exports = router