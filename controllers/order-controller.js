const mysql = require('../mysql');
const fs = require('fs');
const https = require('https');
const axios = require('axios');
const randexp = require('randexp');

exports.getOrders = async (req, res, next) => {
    try {
        const query = `SELECT orders.orderId,
                              orders.quantity,
                              products.productId,
                              products.name,
                              products.price
                         FROM orders
                   INNER JOIN products
                           ON products.productId = orders.productId;`
        const result = await mysql.execute(query);
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
        
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

exports.postOrder = async (req, res, next) => {


    try {
        const queryProduct = 'SELECT * FROM products WHERE productId = ?';
        const resultProduct = await mysql.execute(queryProduct, [req.body.productId]);

        if (resultProduct.length == 0) {
            return res.status(404).send({ message: 'Produto não encontrado'});
        }

        const queryOrder  = 'INSERT INTO orders (productId, quantity) VALUES (?,?)';
        const resultOrder = await mysql.execute(queryOrder, [req.body.productId, req.body.quantity]);

        const response = {
            message: 'Pedido inserido com sucesso',
            createdOrder: {
                orderId: resultOrder.insertId,
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

    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

exports.getOrderDetail = async (req, res, next)=> {
    try {
        const query = 'SELECT * FROM orders WHERE orderId = ?;';
        const result = await mysql.execute(query, [req.params.orderId]);

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

    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

exports.deleteOrder = async (req, res, next) => {
    try {
        const query = `DELETE FROM orders WHERE orderId = ?`;
        await mysql.execute(query, [req.params.orderId]);

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

    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

exports.oAuthGerencianet = async (req, res, next) => {
    try {
        const cert = fs.readFileSync('prod282386.p12');
        const credentials = process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET;
        const auth = Buffer.from(credentials).toString('base64');
        const agent = https.Agent({
            pfx: cert,
            passphrase: ''
        });
        const data = JSON.stringify({ "grant_type": "client_credentials" });

        res.locals.agent = agent

        const config = {
            method: 'POST',
            url: 'https://api-pix.gerencianet.com.br/oauth/token',
            headers: {
                Authorization: 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            httpsAgent: agent,
            data: data
        }

        axios(config)
            .then(response => {
                res.locals.accessToken = response.data.access_token;
                console.log('Auth', response.data);
                next();
            })
            .catch(erro => {
                console.log(error);
                return res.status(500).send({ error: error });
            })

    } catch (error) {
        return res.status(500).send({ error: error });
    }
}

exports.createPixBilling = async (req, res, next) => {
    try {
        const data = JSON.stringify({
            "calendario": { "expiracao": 3600 },
            "devedor": {
              "cpf": req.body.payee.cpf,
              "nome": req.body.payee.name
            },
            "valor": { "original": req.body.value },
            "chave": process.env.CHAVE_PIX,
            "solicitacaoPagador": req.body.description
          });

        txId = new randexp(/^[a-zA-Z0-9]{26,35}$/).gen();

        const config = {
            method: 'PUT',
            url: `https://api-pix.gerencianet.com.br/v2/cob/${txId}`,
            headers: {
                Authorization: 'Bearer ' + res.locals.accessToken,
                'Content-Type': 'application/json'
            },
            httpsAgent: res.locals.agent,
            data: data
        }

        axios(config)
            .then(response => {
                res.locals.billing = response.data;
                console.log('Billing', response.data);
                next();
            })
            .catch(erro => {
                console.log(error);
                return res.status(500).send({ error: error });
            })
    } catch (error) {
        return res.status(500).send({ error: error });
    }
}

exports.getQrCode = async (req, res, next) => {
    try {
        const locId = res.locals.billing.loc.id;
        const config = {
            method: 'GET',
            url: `https://api-pix.gerencianet.com.br/v2/loc/${locId}/qrcode`,
            headers: {
                Authorization: 'Bearer ' + res.locals.accessToken,
                'Content-Type': 'application/json'
            },
            httpsAgent: res.locals.agent
        }

        axios(config)
            .then(response => {
                imgQrCode = decodeBase64Image(response.data.imagemQrcode);
                fs.writeFileSync(`qrcodes/pix-billing-${locId}.jpg`, imgQrCode.data)
                console.log('QrCode', response.data);
                next();
            })
            .catch(erro => {
                console.log(error);
                return res.status(500).send({ error: error });
            })
    } catch (error) {
        return res.status(500).send({ error: error });
    }
}

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};
    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }
    response.type = matches[1];
    response.data = new Buffer.from(matches[2], 'base64');
    return response;
}