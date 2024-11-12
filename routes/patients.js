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
} = require('../controllers/patient.controller')

router.get('/', checkUserPermission('patients', 'read'), readAll)
router.get('/myPatients/read', checkUserPermission('patients', 'read'), readAllByUserId)
router.get('/:id', checkUserPermission('patients', 'read'), readOne)
router.post('/', checkUserPermission('patients', 'create'), createData)
router.put('/:id', checkUserPermission('patients', 'update'), updateData)
router.delete('/:id', checkUserPermission('patients', 'delete'), deleteData)

module.exports = router