const express = require('express')
const router = express.Router()
const { checkUserPermission } = require('../middleware/auth')

const {
	readAll,
	readOne,
	createData,
	updateData,
	deleteData
} = require('../controllers/surgery.controller')

router.get('/', checkUserPermission('surgeries', 'read'), readAll)
router.get('/:id', checkUserPermission('surgeries', 'read'), readOne)
router.post('/', checkUserPermission('surgeries', 'create'), createData)
router.put('/:id', checkUserPermission('surgeries', 'update'), updateData)
router.delete('/:id', checkUserPermission('surgeries', 'delete'), deleteData)

module.exports = router