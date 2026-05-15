const Products = require('../dao/tenantProductsDao');
const { AppError } = require('../../middleware/errorHandler');
const { tenantProducts: mockProducts } = require('../data/tenant-products');

async function listProducts(req, res, next) {
  try {
    const rows = await Products.getAllProducts();
    res.json({ success: true, data: rows });
  } catch (_dbErr) {
    // DB not connected — serve mock data.
    res.json({ success: true, data: mockProducts });
  }
}

async function getProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    const row = await Products.getProductById(id);
    if (!row) return next(new AppError('Product not found', 404));
    res.json({ success: true, data: row });
  } catch (_dbErr) {
    // DB not connected — serve mock data.
    const id = Number(req.params.id);
    const row = mockProducts.find((p) => p.product_id === id);
    if (!row) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, data: row });
  }
}

async function createProduct(req, res, next) {
  try {
    const payload = Object.assign({}, req.body);
    // If token contains tenant_id, enforce tenant scoping
    const tokenTenant = req.user && req.user.tenant_id;
    if (tokenTenant) {
      // allow omitting tenant_id in payload and fill it from token
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

    // ensure product exists and enforce tenant scoping
    const existing = await Products.getProductById(id);
    if (!existing) return next(new AppError('Product not found', 404));

    const tokenTenant = req.user && req.user.tenant_id;
    if (tokenTenant) {
      if (Number(existing.tenant_id) !== Number(tokenTenant)) {
        return next(new AppError('Forbidden: tenant mismatch', 403));
      }
      // prevent changing tenant_id to another tenant
      if (payload.tenant_id && Number(payload.tenant_id) !== Number(tokenTenant)) {
        return next(new AppError('Forbidden: cannot change tenant', 403));
      }
      // enforce tenant_id stays the same as token
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

    const tokenTenant = req.user && req.user.tenant_id;
    if (tokenTenant && Number(existing.tenant_id) !== Number(tokenTenant)) {
      return next(new AppError('Forbidden: tenant mismatch', 403));
    }

    await Products.deleteProduct(id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, removeProduct };
