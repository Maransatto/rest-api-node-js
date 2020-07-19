const mysql = require('../mysql');

exports.deleteImage = async (req, res, next) => {
    try {
        const query = `DELETE FROM productImages WHERE imageId = ?`;
        await mysql.execute(query, [req.params.imageId]);

        const response = {
            message: 'Imagem removida com sucesso',
            request: {
                type: 'POST',
                description: 'Insere um produto',
                url: process.env.URL_API + 'products/' + req.body.productId + '/image',
                body: {
                    productId: 'Number',
                    path: 'File'
                }
            }
        }
        return res.status(202).send(response);

    } catch (error) {
        console.error(error)
        return res.status(500).send({ error: error });
    }
};