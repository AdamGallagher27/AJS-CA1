const express = require('express')
const router = express.Router()
const { checkUserPermission } = require('../middleware/auth')

const {
	readAll,
	readOne,
	readOneByUserId,
	createData,
	updateData,
	deleteData
} = require('../controllers/hospital.controller')

router.get('/', checkUserPermission('hospitals', 'read'), readAll)
router.get('/myHospitals', checkUserPermission('hospitals', 'read'), readOneByUserId)
router.get('/:id', checkUserPermission('hospitals', 'read'), readOne)
router.post('/', checkUserPermission('hospitals', 'create'), createData)
router.put('/:id', checkUserPermission('hospitals', 'update'), updateData)
router.delete('/:id', checkUserPermission('hospitals', 'delete'), deleteData)

module.exports = router