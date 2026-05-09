const Units = require('../dao/unitsDao');
const { AppError } = require('../../middleware/errorHandler');

async function listUnits(req, res, next) {
  try {
    const rows = await Units.getAllUnits();
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

async function getUnit(req, res, next) {
  try {
    const id = Number(req.params.id);
    const row = await Units.getUnitById(id);
    if (!row) return next(new AppError('Unit not found', 404));
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
}

async function createUnit(req, res, next) {
  try {
    const payload = req.body;
    const created = await Units.createUnit(payload);
    res.status(201).json({ success: true, data: created });
  } catch (err) { next(err); }
}

async function updateUnit(req, res, next) {
  try {
    const id = Number(req.params.id);
    const payload = req.body;
    const updated = await Units.updateUnit(id, payload);
    if (!updated) return next(new AppError('Unit not found', 404));
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

async function removeUnit(req, res, next) {
  try {
    const id = Number(req.params.id);
    await Units.deleteUnit(id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
}

module.exports = { listUnits, getUnit, createUnit, updateUnit, removeUnit };
