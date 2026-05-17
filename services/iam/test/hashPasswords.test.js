const { hashPassword, comparePassword } = require('../utils/hashPasswords');

describe('hashPasswords util', () => {
  let expect;
  before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
  });

  it('should hash a password into a different string', async () => {
    const plain = 'mysecretpassword';
    const hashed = await hashPassword(plain);
    
    expect(hashed).to.be.a('string');
    expect(hashed).to.not.equal(plain);
    expect(hashed).to.have.length.greaterThan(20);
  });

  it('should successfully compare a correct password', async () => {
    const plain = 'mysecretpassword';
    const hashed = await hashPassword(plain);
    
    const isValid = await comparePassword(plain, hashed);
    expect(isValid).to.be.true;
  });

  it('should fail comparison for an incorrect password', async () => {
    const plain = 'mysecretpassword';
    const hashed = await hashPassword(plain);
    
    const isValid = await comparePassword('wrongpassword', hashed);
    expect(isValid).to.be.false;
  });
});
