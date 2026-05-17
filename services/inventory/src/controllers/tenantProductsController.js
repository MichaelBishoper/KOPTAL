const Products = require('../dao/tenantProductsDao');
const { AppError } = require('../../middleware/errorHandler');

let productsListCache = [];

async function listProducts(req, res, next) {
  try {
    const rows = await Products.getAllProducts();
    productsListCache = Array.isArray(rows) ? rows : [];
    res.json({ success: true, data: rows });
  } catch {
    res.json({ success: true, data: productsListCache });
  }
}

async function getProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    const row = await Products.getProductById(id);
    if (!row) return next(new AppError('Product not found', 404));
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
}

async function createProduct(req, res, next) {
  try {
    const payload = Object.assign({}, req.body);
    const tokenTenant = req.user && (req.user.tenant_id || (req.user.user_type === 'tenant' ? req.user.user_id : null));
    if (tokenTenant) {
      if (!payload.tenant_id) payload.tenant_id = tokenTenant;
      if (Number(payload.tenant_id) !== Number(tokenTenant)) {
        return next(new AppError('Forbidden: tenant mismatch', 403));
      }
    }

    const created = await Products.createProduct(payload);
    res.status(201).json({ success: true, data: created });
  } catch (err) { next(err); }
}

async function updateProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    const payload = Object.assign({}, req.body);

    const existing = await Products.getProductById(id);
    if (!existing) return next(new AppError('Product not found', 404));

    const tokenTenant = req.user && (req.user.tenant_id || (req.user.user_type === 'tenant' ? req.user.user_id : null));
    if (tokenTenant) {
      if (Number(existing.tenant_id) !== Number(tokenTenant)) {
        return next(new AppError('Forbidden: tenant mismatch', 403));
      }
      if (payload.tenant_id && Number(payload.tenant_id) !== Number(tokenTenant)) {
        return next(new AppError('Forbidden: cannot change tenant', 403));
      }
      payload.tenant_id = tokenTenant;
    }

    const updated = await Products.updateProduct(id, payload);
    if (!updated) return next(new AppError('Product not found', 404));
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

async function removeProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = await Products.getProductById(id);
    if (!existing) return next(new AppError('Product not found', 404));

    const tokenTenant = req.user && (req.user.tenant_id || (req.user.user_type === 'tenant' ? req.user.user_id : null));
    if (tokenTenant && Number(existing.tenant_id) !== Number(tokenTenant)) {
      return next(new AppError('Forbidden: tenant mismatch', 403));
    }

    await Products.deleteProduct(id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
}

async function decrementStock(req, res, next) {
  try {
    const id = Number(req.params.id);
    const quantity = Number(req.body.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return next(new AppError('Quantity must be greater than zero', 400));
    }
    const updated = await Products.decrementStock(id, quantity);
    if (!updated) {
      return next(new AppError('Product not found or insufficient stock', 400));
    }
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

async function incrementStock(req, res, next) {
  try {
    const id = Number(req.params.id);
    const quantity = Number(req.body.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return next(new AppError('Quantity must be greater than zero', 400));
    }
    const updated = await Products.incrementStock(id, quantity);
    if (!updated) {
      return next(new AppError('Product not found', 404));
    }
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, removeProduct, decrementStock, incrementStock };
