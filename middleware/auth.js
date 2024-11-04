const jwt = require('jsonwebtoken')
const permissions = require('../config/permissions')


const userLoggedIn = (req, res, next) => {
	
	const authHeader = req.headers?.authorization?.split(' ')
	if (req.headers?.authorization && authHeader[0] === 'Bearer') {
		jwt.verify(authHeader[1], process.env.JWT_SECRET, (err, decoded) => {
			if (err) req.user = undefined;
			req.user = decoded;
			return next()
		})
	}
	else {
		return res.status(401).json({message: 'Unauthorized: No Auth Token'})

	}
	return res.status(200)
}

const checkUserPermission = (resource, action) => {
	return (req, res, next) => {

		const userRole = req.user?.role

		if(permissions[resource] && permissions[resource][action]?.includes(userRole)) {
			return next()
		}

		return res.status(403).json({message: `Unauthorised: Incorrect Permissions for ${action}`})
	}
}

module.exports = {
	userLoggedIn,
	checkUserPermission
}