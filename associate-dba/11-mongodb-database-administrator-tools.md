## 12 - MongoDB Database Administrator Tools

### Get Started with DBA tools

[The MongoDB Database Tools](https://www.mongodb.com/docs/database-tools/)

- The MongoDB Database Tools are a suite of command-line utilities for working with MongoDB

- `Binary Import / Export`
    - `mongodump` - Creates a binary export of the contents of a mongod database.
    - `mongorestore` - Restores data from a `mongodump` database dump into a mongod or mongos
    - `bsondump` - Converts BSON dump files into JSON.
- `Data Import / Export`
    - `mongoimport` - Imports content from an Extended JSON, CSV, or TSV export file.
    - `mongoexport` - Produces a JSON or CSV export of data stored in a `mongod` instance.
- `Diagnostic Tools`
    - `mongostat` - Provides a quick overview of the status of a currently running `mongod` or `mongos` instance.
    - `mongotop` - Provides an overview of the time a mongod instance spends reading and writing data.
- `GridFS Tools`
    - `mongofiles` - Supports manipulating files stored in your MongoDB instance in GridFS objects.

Install with `brew` on MacOS

```bash
brew tap mongodb/brew
brew install mongodb-database-tools
```

### Backup Tools

`mongodump` -> https://www.mongodb.com/docs/database-tools/mongodump/

- is a utility that creates a binary export of a database's contents
- `mongorestore` allows you to import data that was exported from `mongodump`.
- for `standalone` or a `replica set`, `mongodump` can be a part of a backup strategy with `mongorestore`
- Not recommended for `sharded clusters`, for those use:
  - MongoDB Atlas
  - MongoDB Cloud Manager
  - MongoDB Ops Manager
  
- mongodump dumps:
  - Collection documents
  - Index definitions
  - Writes that occur during the export, if run with the mongodump `--oplog` option.

```bash
mongodump
--out // by default to `dump` directory, a subdirectory for each database
--db // limit the database 
--collection // limit the collection
--readPreference // reduces pressure on the primary
--gzip // compresses output dump directory, (.gz extension for the metadata json and bson files)
--archive // one file only 
--oplog // creates top level `oplog.bson` which contains write operations that occur during the `mongodump` run.
```

Examples:

```bash
# backup the sample_analytics database
mongodump -v --gzip --archive=sample_analytics_backup.gz \
 "mongodb+srv://altfatterz@demo-cluster.odqjme8.mongodb.net/sample_analytics"
 
# backup the sample_analytics database 
mongodump -v --gzip --archive=sample_analytics_backup.gz --db sample_analytics \
 "mongodb+srv://altfatterz@demo-cluster.odqjme8.mongodb.net"

# oplog supports only full database dumps
# created a `dump` folder
mongodump -v --oplog "mongodb://localhost:27017"  
```

### Restore Tools

`monogrestore` -> https://www.mongodb.com/docs/database-tools/mongorestore/

- Does not update matching documents, but does insert new ones

Examples:

```bash
# restore to local mongodb installation from an archive file
mongorestore -v --gzip --archive=sample_analytics_backup.gz --drop "mongodb://localhost:27017"

# Restore with Access Control
mongorestore --uri="mongodb://user@mongodb1.example.net:27017/?authSource=admin" /opt/backup/mongodump-2011-10-24
# alternatively
mongorestore --host=mongodb1.example.net --port=27017 --username=user --authenticationDatabase=admin /opt/backup/mongodump-2011-10-24

# Restore a Collection
mongorestore --nsInclude=test.purchaseorders dump/
# Restore a specific collection using the --db, --collection, and a .bson file
mongorestore --db=test --collection=purchaseorders dump/test/purchaseorders.bson
```

### Data Export Tools

`mongoexport` -> https://www.mongodb.com/docs/database-tools/mongoexport/

- is a database tool that produces a `JSON` or `CSV` export of data stored in a MongoDB instance.
- can be used on `standalone`, `replica` set or `sharded cluster` deployments 
- use it together with `mongoimport`

Examples:

```bash
# canonical format, more type reservation
# "$date":{"$numberLong":"1483574400000"} vs {"date":{"$date":"2016-12-01T00:00:00Z"}
mongoexport -v --collection transactions --query '{"transaction_count": {"$gte": 50}}' --out transactions_canonical.json \
 --jsonFormat canonical \
 "mongodb+srv://altfatterz@demo-cluster.odqjme8.mongodb.net/sample_analytics"

# relaxed format
mongoexport -v --collection transactions --query '{"transaction_count": {"$gte": 50}}' --out transactions_relaxed.json \
 --jsonFormat relaxed \
 "mongodb+srv://altfatterz@demo-cluster.odqjme8.mongodb.net/sample_analytics"
```

- the `--query` must be in `Extended JSON v2 format` (either `relaxed` or `canonical/strict mode`) -> https://www.mongodb.com/docs/manual/reference/mongodb-extended-json/ 

### Data Import Tools

`mongoimport` -> https://www.mongodb.com/docs/database-tools/mongoimport/

- `mongoimport` imports content from an Extended JSON, CSV, or TSV export created by mongoexport,
- can be used on `standalone`, `replica` set or `sharded cluster` deployments
- supports data files that are UTF-8 encoded
- uses batching to efficiently load data

Examples:

```bash
mongoimport -v --collection new_transactions --type json --mode insert --drop --file transactions_relaxed.json \
 "mongodb://localhost:27017"
```

### Diagnostic Tools: `mongostat`

### Diagnostic Tools: `bsondump`

### MongoDB as a filesystem

