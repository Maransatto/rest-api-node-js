const express = require('express');
const router = express.Router();

const orderController = require('../controllers/order-controller');

router.get('/',                         orderController.getOrders);
router.post('/',                        orderController.postOrder);
router.get('/:orderId',                 orderController.getOrderDetail);
router.delete('/:orderId',              orderController.deleteOrder);

router.post('/:orderId/pix/billing',    orderController.oAuthGerencianet,
                                        orderController.createPixBilling,
                                        orderController.getQrCode)

module.exports = router;