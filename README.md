# OpenArena Logfile Parser

## Usage

Install _ts-node_ globally and use it to run the script:

```bash
npm install --global ts-node
ts-node src/cli/stats-to-db USER/PASSWORD@HOST[:PORT]/DATABASE FILE_PATTERN
```

The first parameter is the Postgres database connection.
The second parameter is file pattern matching the GLOB specification.

You also can compile the sources with _tsc_ and run it with node
```bash
npm run build
node dist/cli/stats-to-db ...
```

## Setup with Docker

You can use docker to setup an environment

```bash
# create database container
docker run --name oa-db -p 5432:5432 -d -e POSTGRES_PASSWORD=pass postgres
# copy script to container
docker cp db/create.sql oa-db:/tmp
# execute script
docker exec -it oa-db psql -U postgres -f /tmp/create.sql

# import the logs
ts-node src/cli/stats-to-db postgres/pass@localhost/postgres myfile.log
```

You can also run Adminer to manage the database

```bash
# start adminer container
docker run --name adminer -p 5433:8080 --link oa-db -d adminer
```

Open http://localhost:5433 in a browser and enter the connection data. The host is _oa-db_ (The same name as the linked container).