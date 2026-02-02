const productRepo = require('../repositories/productRepo');
const lotRepo = require('../repositories/lotRepo');

async function list(req, res, next) {
  try {
    const products = await productRepo.listAll();
    res.json(products);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const data = req.body;
    if (!data.nombre || typeof data.precio === 'undefined') return res.status(400).json({ error: 'nombre y precio requeridos' });
    const prod = await productRepo.create(data);
    res.status(201).json(prod);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const id = req.params.id;
    const data = req.body;
    const prod = await productRepo.update(id, data);
    res.json(prod);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const id = req.params.id;
    await productRepo.remove(id);
    res.json({ ok: true });
  } catch (err) { next(err); }
}

async function addLot(req, res, next) {
  try {
    const producto_id = req.params.id;
    const { cantidad, fecha_vencimiento } = req.body;
    if (!cantidad || cantidad <= 0) return res.status(400).json({ error: 'cantidad inválida' });
    const lot = await lotRepo.create({ producto_id, cantidad, fecha_vencimiento });
    // registrar movimiento de ingreso
    await require('../db/knex')('stock_movements').insert({ producto_id, lote_id: lot.id, tipo: 'ingreso', cantidad, referencia: 'ingreso_manual' });
    res.status(201).json(lot);
  } catch (err) { next(err); }
}

async function alerts(req, res, next) {
  try {
    const alerts = await productRepo.getAlerts();
    res.json(alerts);
  } catch (err) { next(err); }
}

module.exports = { list, create, update, remove, addLot, alerts };
