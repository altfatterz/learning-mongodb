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

### Data Import Tools

### Diagnostic Tools: `mongostat`

### Diagnostic Tools: `bsondump`

### MongoDB as a filesystem

