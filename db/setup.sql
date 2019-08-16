CREATE TABLE member (
    id text NOT NULL,
    name text
);

CREATE TABLE chat (
    id text  NOT NULL,
    name text,
    owner text,
    color text,
    members text []
);

CREATE TABLE message (
    id text NOT NULL,
    chat text,
    by text,
    date timestamp,
    message text
);