const express = require('express')
const router = express.Router()
const { checkUserPermission } = require('../middleware/auth')
const { loginRequired } = require('../controllers/user.controller')

const {
	readAll,
	readOne,
	readAllByUserId,
	createData,
	updateData,
	deleteData
} = require('../controllers/hospital.controller')

router.get('/', readAll)
router.get('/:id', readOne)

router.get('/myHospitals/read', loginRequired,  checkUserPermission('hospitals', 'read'), readAllByUserId)
router.post('/', loginRequired, checkUserPermission('hospitals', 'create'), createData)
router.put('/:id', loginRequired, checkUserPermission('hospitals', 'update'), updateData)
router.delete('/:id', loginRequired, checkUserPermission('hospitals', 'delete'), deleteData)

module.exports = router