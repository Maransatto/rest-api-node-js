const mysql = require('../mysql');

exports.getProducts = async (req, res, next) => {
    try {
        let name = '';
        if (req.query.name) {
            name = req.query.name;    
        }
    
        const query = `
            SELECT *
               FROM products
              WHERE categoryId = ?
                AND (
                    name LIKE '%${name}%'
                );
        `;
        const result = await mysql.execute(query, [
            req.query.categoryId
        ])
        const response = {
            length: result.length,
            products: result.map(prod => {
                return {
                    productId: prod.productId,
                    name: prod.name,
                    price: prod.price,
                    productImage: prod.productImage,
                    request: {
                        type: 'GET',
                        description: 'Retorna os detalhes de um produto específico',
                        url: process.env.URL_API + 'produtos/' + prod.productId
                    }
                }
            })
        }
        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

exports.postProduct = async (req, res, next) => {
    try {
        const query = 'INSERT INTO products (name, price, productImage, categoryId) VALUES (?,?,?,?)';
        const result = await mysql.execute(query, [
            req.body.name,
            req.body.price,
            req.file.path,
            req.body.categoryId,
        ]);

        const response = {
            message: 'Produto inserido com sucesso',
            createdProduct: {
                productId: result.insertId,
                name: req.body.name,
                price: req.body.price,
                productImage: req.file.path,
                categoryId: req.body.categoryId,
                request: {
                    type: 'GET',
                    description: 'Retorna todos os produtos',
                    url: process.env.URL_API + 'produtos'
                }
            }
        }
        return res.status(201).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

exports.getProductDetail = async (req, res, next)=> {
    try {
        const query = 'SELECT * FROM products WHERE productId = ?;';
        const result = await mysql.execute(query, [req.params.productId]);

        if (result.length == 0) {
            return res.status(404).send({
                message: 'Não foi encontrado produto com este ID'
            })
        }
        const response = {
            product: {
                productId: result[0].productId,
                name: result[0].name,
                price: result[0].price,
                productImage: result[0].productImage,
                request: {
                    type: 'GET',
                    description: 'Retorna todos os produtos',
                    url: process.env.URL_API + 'produtos'
                }
            }
        }
        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

exports.updateProduct = async (req, res, next) => {

    try {
        const query = ` UPDATE products
                           SET name         = ?,
                               price        = ?
                         WHERE productId    = ?`;
        await mysql.execute(query, [
            req.body.name,
            req.body.price,
            req.params.productId
        ]);
        const response = {
            message: 'Produto atualizado com sucesso',
            upatedProduct: {
                productId: req.params.productId,
                name: req.body.name,
                price: req.body.price,
                request: {
                    type: 'GET',
                    description: 'Retorna os detalhes de um produto específico',
                    url: process.env.URL_API + 'produtos/' + req.params.productId
                }
            }
        }
        return res.status(202).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const query = `DELETE FROM products WHERE productId = ?`;
        await mysql.execute(query, [req.params.productId]);

        const response = {
            message: 'Produto removido com sucesso',
            request: {
                type: 'POST',
                description: 'Insere um produto',
                url: process.env.URL_API + 'produtos',
                body: {
                    name: 'String',
                    price: 'Number'
                }
            }
        }
        return res.status(202).send(response);

    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

exports.postImage = async (req, res, next) => {
    try {
        const query = 'INSERT INTO productImages (productId, path) VALUES (?,?)';
        const result = await mysql.execute(query, [
            req.params.productId,
            req.file.path
        ]);

        const response = {
            message: 'Imagem inserida com sucesso',
            createdImage: {
                productId: parseInt(req.params.productId),
                imageId: result.insertId,
                path: req.file.path,
                request: {
                    type: 'GET',
                    description: 'Retorna todos as imagens',
                    url: process.env.URL_API + 'produtos/' + req.params.productId + '/imagens'
                }
            }
        }
        return res.status(201).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

exports.getImages = async (req, res, next) => {
    try {
        const query  = "SELECT * FROM productImages WHERE productId = ?;"
        const result = await mysql.execute(query, [req.params.productId])
        const response = {
            length: result.length,
            images: result.map(img => {
                return {
                    productId: parseInt(req.params.productId),
                    imageId: img.imageId,
                    path: process.env.URL_API + img.path
                }
            })
        }
        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};