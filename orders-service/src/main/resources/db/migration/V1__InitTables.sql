CREATE TABLE ProductOrder (
    id BIGSERIAL PRIMARY KEY,
    date varchar(25) NOT NULL,
    total_order_price NUMERIC NOT NULL
);