#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE db_iam;
    CREATE DATABASE db_category;
    CREATE DATABASE db_inventory;
    CREATE DATABASE db_procurement;
    CREATE DATABASE db_logistics;
    CREATE DATABASE db_rating;
    CREATE DATABASE db_fileupload;
EOSQL
