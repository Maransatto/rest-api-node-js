const mysql = require('../mysql').pool;

exports.getOrders = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query( `SELECT orders.orderId,
                            orders.quantity,
                            products.productId,
                            products.name,
                            products.price
                       FROM orders
                 INNER JOIN products
                         ON products.productId = orders.productId;`,
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    orders: result.map(order => {
                        return {
                            orderId: order.orderId,
                            quantity: order.quantity,
                            product: {
                                productId: order.productId,
                                name: order.name,
                                price: order.price
                            },
                            request: {
                                type: 'GET',
                                description: 'Retorna os detalhes de um pedido específico',
                                url: process.env.URL_API + 'orders/' + order.orderId
                            }
                        }
                    })
                }
                return res.status(200).send(response);
            }
        )
    });
};

exports.postOrder = (req, res, next) => {

    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query('SELECT * FROM products WHERE productId = ?',
        [req.body.productId],
        (error, result, field) => {
            if (error) { return res.status(500).send({ error: error }) }
            if (result.length == 0) {
                return res.status(404).send({
                    message: 'Produto não encontrado'
                })
            }
            conn.query(
                'INSERT INTO orders (productId, quantity) VALUES (?,?)',
                [req.body.productId, req.body.quantity],
                (error, result, field) => {
                    conn.release();
                    if (error) { return res.status(500).send({ error: error }) }
                    const response = {
                        message: 'Pedido inserido com sucesso',
                        createdOrder: {
                            orderId: result.insertId,
                            productId: req.body.productId,
                            quantity: req.body.quantity,
                            request: {
                                type: 'GET',
                                description: 'Retorna todos os pedidos',
                                url: process.env.URL_API + 'orders'
                            }
                        }
                    }
                    return res.status(201).send(response);
                }
            )

        })
    });
};

exports.getOrderDetail = (req, res, next)=> {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM orders WHERE orderId = ?;',
            [req.params.orderId],
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }
                if (result.length == 0) {
                    return res.status(404).send({
                        message: 'Não foi encontrado pedido com este ID'
                    })
                }
                const response = {
                    order: {
                        orderId: result[0].orderId,
                        productId: result[0].productId,
                        quantity: result[0].quantity,
                        request: {
                            type: 'GET',
                            description: 'Retorna todos os pedidos',
                            url: process.env.URL_API + 'orders'
                        }
                    }
                }
                return res.status(200).send(response);
            }
        )
    });
};

exports.deleteOrder = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `DELETE FROM orders WHERE orderId = ?`, [req.params.orderId],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    message: 'Pedido removido com sucesso',
                    request: {
                        type: 'POST',
                        description: 'Insere um pedido',
                        url: process.env.URL_API + 'orders',
                        body: {
                            productId: 'Number',
                            quantity: 'Number'
                        }
                    }
                }
                return res.status(202).send(response);
            }
        )
    });
};