const express = require('express')
const router = express.Router()
const { checkUserPermission } = require('../middleware/auth')

const {
	readAll,
	readOne,
	readAllByUserId,
	createData,
	updateData,
	deleteData
} = require('../controllers/surgery.controller')

router.get('/', checkUserPermission('surgeries', 'read'), readAll)
router.get('/mySurgeries/read', checkUserPermission('surgeries', 'read'), readAllByUserId)
router.get('/:id', checkUserPermission('surgeries', 'read'), readOne)
router.post('/', checkUserPermission('surgeries', 'create'), createData)
router.put('/:id', checkUserPermission('surgeries', 'update'), updateData)
router.delete('/:id', checkUserPermission('surgeries', 'delete'), deleteData)

module.exports = router