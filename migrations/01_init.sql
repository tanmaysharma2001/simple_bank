create table users
(
    id serial unique not null,
    first_name varchar(50),
    last_name varchar(50),
    email varchar(50) unique not null,
    password varchar(100),
    token          varchar(200),
    account_number varchar(30) unique not null,
    PRIMARY KEY (id, email, account_number)
);

create table accounts
(
    account_number varchar(50) primary key,
    account_type   varchar(30)    not null,
    balance        numeric(10, 2) not null
);


create table internal_transactions
(
    id                         serial         not null,
    source_account_number      varchar(50),
    destination_account_number varchar(50)    not null,
    transaction_type           VARCHAR(20)    NOT NULL,
    transaction_amount         NUMERIC(10, 2) NOT NULL,
    transaction_date           TIMESTAMP      NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    FOREIGN KEY (source_account_number) REFERENCES accounts (account_number) ON DELETE CASCADE,
    FOREIGN KEY (destination_account_number) REFERENCES accounts (account_number) ON DELETE CASCADE
);


CREATE TABLE external_transactions
(
    id                         SERIAL PRIMARY KEY,
    source_account_number      VARCHAR(50)    NOT NULL,
    destination_bank_name      VARCHAR(100)   NOT NULL,
    destination_account_number VARCHAR(50)    NOT NULL,
    transaction_type           VARCHAR(20)    NOT NULL,
    transaction_amount         NUMERIC(10, 2) NOT NULL,
    transaction_date           TIMESTAMP      NOT NULL DEFAULT NOW(),
    FOREIGN KEY (source_account_number) REFERENCES accounts (account_number) ON DELETE CASCADE
);