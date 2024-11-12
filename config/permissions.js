// this config holds the permissions for each opperation on each resources
const permissions = {
  hospitals: {
    read: ['user', 'admin'],
    create: ['admin'],
    update: ['admin'],
    delete: ['admin']
  },
  rooms: {
    read: ['user', 'admin'],
    create: ['admin'],
    update: ['admin'],
    delete: ['admin']
  },
  surgeries: {
    read: ['user', 'admin'],
    create: ['admin'],
    update: ['admin'],
    delete: ['admin']
  },
  patients: {
    read: ['user', 'admin'],
    create: ['admin'],
    update: ['admin'],
    delete: ['admin']
  },
  workers: {
    read: ['user', 'admin'],
    create: ['admin'],
    update: ['admin'],
    delete: ['admin']
  },
  users: {
    makeAdmin: ['admin']
  }
}

module.exports = permissions