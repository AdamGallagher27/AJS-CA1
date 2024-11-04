const express = require('express')
const router = express.Router()
const { checkUserPermission, userLoggedIn } = require('../middleware/auth')

const {
	readAll,
	readOne,
	createData,
	updateData,
	deleteData
} = require('../controllers/patient.controller')

router.get('/', userLoggedIn, checkUserPermission('patients', 'read'), readAll)
router.get('/:id', userLoggedIn, checkUserPermission('patients', 'read'), readOne)
router.post('/', userLoggedIn, checkUserPermission('patients', 'create'), createData)
router.put('/:id', userLoggedIn, checkUserPermission('patients', 'update'), updateData)
router.delete('/:id', userLoggedIn, checkUserPermission('patients', 'delete'), deleteData)

module.exports = router