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
} = require('../controllers/room.controller')

router.get('/', checkUserPermission('rooms', 'read'), readAll)
router.get('/myRooms/read', checkUserPermission('rooms', 'read'), readOneByUserId)
router.get('/:id', checkUserPermission('rooms', 'read'), readOne)
router.post('/', checkUserPermission('rooms', 'create'), createData)
router.put('/:id', checkUserPermission('rooms', 'update'), updateData)
router.delete('/:id', checkUserPermission('rooms', 'delete'), deleteData)

module.exports = router