*This folder contains files relating to the database.*

# Database Dump
You can produce a dump file with the following command:

`pg_dump -h localhost -U postgres -p 5432 identifire_dbname > identifire_test.dump`

# Database Restore
You can restore the database from the dump file located in the database folder.

Note that this will restore both the schema **and** all data from the database.

you can restore the dump file by running the following command using psql:

`psql -U your_username database_name < dump_file_name.dump`
