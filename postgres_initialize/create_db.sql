CREATE TABLE attractions (
    id varchar(255) PRIMARY KEY,
    name varchar(511) NOT NULL
);

CREATE TABLE wait_times (
    attraction_id varchar(255) NOT NULL,
    timestamp timestamp NOT NULL,
    wait_time int NOT NULL,
    operating boolean NOT NULL,
    PRIMARY KEY(attraction_id, timestamp)
);