const express = require('express');
const router = express.Router();

const PedidosController = require('../controllers/pedidos-controller');

router.get('/', PedidosController.getPedidos);
router.post('/', PedidosController.postPedidos);
router.get('/:id_pedido', PedidosController.getUmPedido);
router.delete('/', PedidosController.deletePedido);

module.exports = router;