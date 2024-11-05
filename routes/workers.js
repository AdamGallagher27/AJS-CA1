const express = require('express')
const router = express.Router()
const { checkUserPermission } = require('../middleware/auth')

const {
	readAll,
	readOne,
	createData,
	updateData,
	deleteData
} = require('../controllers/worker.controller')

router.get('/', checkUserPermission('workers', 'read'), readAll)
router.get('/:id', checkUserPermission('workers', 'read'), readOne)
router.post('/', checkUserPermission('workers', 'create'), createData)
router.put('/:id', checkUserPermission('workers', 'update'), updateData)
router.delete('/:id', checkUserPermission('workers', 'delete'), deleteData)

module.exports = router