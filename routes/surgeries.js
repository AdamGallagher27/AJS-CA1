const express = require('express')
const router = express.Router()
const { checkUserPermission, userLoggedIn } = require('../middleware/auth')

const {
	readAll,
	readOne,
	createData,
	updateData,
	deleteData
} = require('../controllers/surgery.controller')

router.get('/', userLoggedIn, checkUserPermission('surgeries', 'read'), readAll)
router.get('/:id', userLoggedIn, checkUserPermission('surgeries', 'read'), readOne)
router.post('/', userLoggedIn, checkUserPermission('surgeries', 'create'), createData)
router.put('/:id', userLoggedIn, checkUserPermission('surgeries', 'update'), updateData)
router.delete('/:id', userLoggedIn, checkUserPermission('surgeries', 'delete'), deleteData)

module.exports = router