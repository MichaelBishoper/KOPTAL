const bcrypt = require('bcrypt')

const hash = await bcrypt.hash('admin12345678', 10);