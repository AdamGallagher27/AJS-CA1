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
} = require('../controllers/worker.controller')

router.get('/', checkUserPermission('workers', 'read'), readAll)
router.get('/myWorkers/read', checkUserPermission('workers', 'read'), readAllByUserId)
router.get('/:id', checkUserPermission('workers', 'read'), readOne)
router.post('/', checkUserPermission('workers', 'create'), createData)
router.put('/:id', checkUserPermission('workers', 'update'), updateData)
router.delete('/:id', checkUserPermission('workers', 'delete'), deleteData)

module.exports = router