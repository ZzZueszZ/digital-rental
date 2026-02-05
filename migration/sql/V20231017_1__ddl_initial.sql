create table `configuration_groups`
(
    `configuration_group_id` integer      not null auto_increment,
    `created_by`             integer,
    `display_order`          integer      not null,
    `updated_by`             integer,
    `created_at`             datetime(6)  not null,
    `updated_at`             datetime(6),
    `code`                   varchar(255) not null,
    `created_program`        varchar(255),
    `name`                   varchar(255) not null,
    primary key (`configuration_group_id`)
) engine = InnoDB;

create table `configurations`
(
    `configuration_group_id` integer      not null,
    `configuration_id`       integer      not null auto_increment,
    `created_by`             integer,
    `required`               bit          not null,
    `updated_by`             integer,
    `created_at`             datetime(6)  not null,
    `updated_at`             datetime(6),
    `code`                   varchar(255) not null,
    `created_program`        varchar(255),
    `description`            varchar(255) not null,
    `name`                   varchar(255) not null,
    `options`                varchar(255) not null,
    `type`                   varchar(255) not null,
    `value`                  varchar(255) not null,
    primary key (`configuration_id`)
) engine = InnoDB;

create table `users`
(
    `created_by`      integer,
    `deleted`         bit          not null,
    `updated_by`      integer,
    `user_id`         integer      not null auto_increment,
    `created_at`      datetime(6)  not null,
    `updated_at`      datetime(6),
    `created_program` varchar(255),
    `email`           varchar(255) not null,
    `password`        varchar(255) not null,
    `username`        varchar(255) not null,
    primary key (`user_id`)
) engine = InnoDB;

alter table `configuration_groups`
    add constraint UK_thkr0n10n0gj41qb78m3pps02 unique (`code`);

alter table `configurations`
    add constraint UK_164or1kxh0jkjtqg51pnnvnc1 unique (`code`);

alter table `users`
    add constraint UK_6dotkott2kjsp8vw4d0m25fb7 unique (`email`);

alter table `users`
    add constraint UK_r43af9ap4edm43mmtq01oddj6 unique (`username`);


CREATE TABLE organizations
(
    org_id   integer      not null auto_increment,
    org_code varchar(100)           NOT NULL,
    org_name varchar(256)           NOT NULL,
    parent_id integer NULL,
    `path`   varchar(500)           NULL,
    status integer DEFAULT 0 NOT NULL,
    primary key (`org_id`)
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_general_ci;
