const salesService = require('../services/salesService');

async function createSale(req, res) {
  const vendedor_id = req.user.id;
  const { items, total } = req.body; // items: [{ producto_id, cantidad, precio_unitario }]
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items requeridos' });
  try {
    const sale = await salesService.createSale(vendedor_id, items, total);
    res.status(201).json(sale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function salesReport(req, res) {
  const { from, to } = req.query;
  const report = await salesService.salesReport({ from, to });
  res.json(report);
}

async function getSaleDetails(req, res) {
  try {
    const saleDetails = await salesService.getSaleDetails(req.params.id);
    res.json(saleDetails);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

module.exports = { createSale, salesReport, getSaleDetails };
