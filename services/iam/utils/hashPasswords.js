// Functions for password hashing and hash comparisons
const bcrypt = require('bcrypt');

const saltRounds = 10;

async function hashPassword(plainPassowrd) {
    return await bcrypt.hash(plainPassowrd, saltRounds)
}

async function comparePassword(plainPassowrd, hashedPassword) {
    return await bcrypt.compare(plainPassowrd, hashedPassword) // returns an ORLEAN (TURE or FALSE)
}

module.exports = { hashPassword, comparePassword }

