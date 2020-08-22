-- 16/07/2020
CREATE TABLE IF NOT EXISTS productImages (
    imageId INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    productId INT,
    path VARCHAR(255),
    FOREIGN KEY (productId) REFERENCES products (productId)
);

-- refactoring pra inglês
drop table pedidos;
drop table usuarios;
drop table imagens_produtos;
drop table produtos;

CREATE TABLE IF NOT EXISTS products (
    productId INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(45),
    price FLOAT,
    productImage VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS orders (
    orderId INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    productId INT,
    quantity INT,
    FOREIGN KEY (productId) REFERENCES products (productId)
);

CREATE TABLE IF NOT EXISTS users (
    userId INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100),
    password VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS productImages (
    imageId INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    productId INT,
    path VARCHAR(255),
    FOREIGN KEY (productId) REFERENCES products (productId)
);

-- 22/08/2020
CREATE TABLE IF NOT EXISTS categories (
    categoryId INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100)
);

ALTER TABLE products ADD categoryId INT NULL;

INSERT INTO categories (name) VALUES ('Material Escolar');

UPDATE products SET categoryId = 1;

ALTER TABLE products MODIFY categoryId INT NOT NULL;
ALTER TABLE products ADD CONSTRAINT fk_product_category
FOREIGN KEY (categoryId) REFERENCES categories(categoryId);

