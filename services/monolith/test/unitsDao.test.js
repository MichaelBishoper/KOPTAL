const sinon = require('sinon');
const pool = require('../src/config/db');
const unitsDao = require('../src/dao/unitsDao');

describe('unitsDao', () => {
  let expect;
  let queryStub;

  before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
  });

  beforeEach(() => {
    queryStub = sinon.stub(pool, 'query');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getAllUnits', () => {
    it('should return all units', async () => {
      const mockUnits = [
        { unit_id: 1, unit_name: 'Kilogram', unit_symbol: 'kg', unit_type: 'Weight' },
        { unit_id: 2, unit_name: 'Piece', unit_symbol: 'pcs', unit_type: 'Quantity' },
      ];
      queryStub.resolves({ rows: mockUnits });

      const result = await unitsDao.getAllUnits();
      
      expect(queryStub.calledOnce).to.be.true;
      expect(result).to.deep.equal(mockUnits);
    });
  });

  describe('getUnitById', () => {
    it('should return a unit by id', async () => {
      const mockUnit = { unit_id: 1, unit_name: 'Kilogram', unit_symbol: 'kg', unit_type: 'Weight' };
      queryStub.resolves({ rows: [mockUnit] });

      const result = await unitsDao.getUnitById(1);

      expect(queryStub.calledWith('SELECT unit_id, unit_name, unit_symbol, unit_type FROM units WHERE unit_id = $1', [1])).to.be.true;
      expect(result).to.deep.equal(mockUnit);
    });
  });

  describe('createUnit', () => {
    it('should insert and return the new unit', async () => {
      const newUnit = { unit_name: 'Liter', unit_symbol: 'L', unit_type: 'Volume' };
      const returnedUnit = { unit_id: 3, ...newUnit };
      queryStub.resolves({ rows: [returnedUnit] });

      const result = await unitsDao.createUnit(newUnit);

      expect(queryStub.calledOnce).to.be.true;
      expect(result).to.deep.equal(returnedUnit);
    });
  });

  describe('updateUnit', () => {
    it('should update and return the modified unit', async () => {
      const updateData = { unit_name: 'Litres', unit_symbol: 'L', unit_type: 'Volume' };
      const returnedUnit = { unit_id: 3, ...updateData };
      queryStub.resolves({ rows: [returnedUnit] });

      const result = await unitsDao.updateUnit(3, updateData);

      expect(queryStub.calledOnce).to.be.true;
      expect(result).to.deep.equal(returnedUnit);
    });
  });

  describe('deleteUnit', () => {
    it('should delete a unit', async () => {
      queryStub.resolves({});

      await unitsDao.deleteUnit(1);

      expect(queryStub.calledWith('DELETE FROM units WHERE unit_id = $1', [1])).to.be.true;
    });
  });
});
