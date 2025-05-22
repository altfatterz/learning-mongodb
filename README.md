### Inserting

- db.<collection-name>.insertOne( document )
    - `insertedId` is returned for the newly inserted document
- db.<collection-name>.insertMany( [ document1, document2, ...])
    - `insertedIds` contains the ids of the newly inserted documents
- if the collection does not exists it will be auto-created.
- every document must have a _id which must be unique
-

### Finding documents

- $eg
- $in
- $gt
- $gte
- $lt
- $lte
- $elemMatch // query arrays
- $and
- $or

```bash
# the items array field contains the results
$ db.zips.find() # with it you can iterate over, will return by default max 20 documents (defined by displayBatchSize)
$ db.grades.find( { student_id: { $eq: 1 } } )
$ db.grades.find( { student_id: 1 } )
$ db.grades.find( { class_id: { $in: [ 465, 456] } } ).count()
# to access subdocuments, you must use the syntax “field.nestedfield”, which includes quotation marks.
$ db.sales.find({ "items.price": { $gt: 50}})
$ db.sales.find({ "customer.age": { $lte: 65}}).count()
# Find Documents with an Array That Contains a Specified Value, returns also fields which are not an array
$ db.accounts.find({ products: "InvestmentFund"}).count()
# if you want to return documents which contain matching element of an array use $elemMatch
$ db.accounts.find({ products: { $elemMatch: {$eq: "InvestmentFund" }  } }).count()
# Use the $elemMatch operator to find all documents that contain the specified subdocument. 
$ db.sales.find({
  items: {
    $elemMatch: { name: "laptop", price: { $gt: 800 }, quantity: { $gte: 1 } },
  },
})
# $and implicit operator
$ db.routes.find({ "airline.name": "Southwest Airlines", stops: { $gte: 1 } })
$ $or operator
$ db.routes.find({
  $or: [{ dst_airport: "SEA" }, { src_airport: "SEA" }],
})
# mixing $and and $or
$ db.routes.find({
  $and: [
    { $or: [{ dst_airport: "SEA" }, { src_airport: "SEA" }] },
    { $or: [{ "airline.name": "American Airlines" }, { airplane: 320 }] },
  ]
})
# Note, this does not work, the first $or was overwritten by the subsequent $or operation
$ db.routes.find({
    { $or: [{ dst_airport: "SEA" }, { src_airport: "SEA" }] },
    { $or: [{ "airline.name": "American Airlines" }, { airplane: 320 }] },
})
```

### replace documents

```bash
# use the filter on the _id field, to ensure you update a single document
$ db.<collection>.replaceOne(<filter>, <document>, <options>) // options document is not required 
```

```bash
db.books.replaceOne(
  { _id: ObjectId("6282afeb441a74a98dbbec4e")},
  {
    title: "Data Science Fundamentals for Python and MongoDB",
    isbn: "1484235967",
    publishedDate: new Date("2018-5-10"),
    thumbnailUrl: "https://m.media-amazon.com/images/I/71opmUBc2wL._AC_UY218_.jpg",
    authors: ["David Paper"],
    categories: ["Data Science"],
  }
)

{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
```

### update documents

```bash
// options document is not required, <document> here can contain operators like $set or $push 
$ db.<collection>.updateOne(<filter>, <document>, <options>) 
```

`$set` - replaces the value of a field with the specified value or adds the field if not existing

```bash
db.podcasts.updateOne(
  { _id: ObjectId("5e8f8f8f8f8f8f8f8f8f8f8") },
  { $set: { subscribers: 98562} }
)
```

- `$push` operator adds a new value to the hosts array field or creates the array field if does not exist
- not that using this operator is not idempotent

```bash
db.podcasts.updateOne(
  { _id: ObjectId("5e8f8f8f8f8f8f8f8f8f8f8") },
  { $push: { hosts: "Nic Raboy" } }
)
```

- `upsert` option creates a new document if no documents match the filtered criteria

```bash
db.podcasts.updateOne(
  { title: "The Developer Hub" },
  { $set: { topics: ["databases", "MongoDB"] } },
  { upsert: true }
)
{
  acknowledged: true,
  insertedId: ObjectId('5e8f8f8f8f8f8f8f8f8f8f9')
  matchedCount: 0,
  modifiedCount: 0,
  upsertedCount: 1
}
```

### findAndModify

- is used to find and replace a single document in MongoDB
- we could use updateOne() + findOne() but that is 2 round trips with possibility that in between was another
  modification meanwhile
- if `new` option is not set then the updated document is not returned
- in the `update` part you can use other operators like `$set`, `$push`, etc

```bash
db.podcasts.findAndModify({
  query: { _id: ObjectId("6261a92dfee1ff300dc80bf1") },
  update: { $inc: { subscribers: 1 } },
  new: true,
})
db.zips.findAndModify({
  query: { zip: 87571 },
  update: { $set: { city: "TAOS", state: "NM", pop: 40000 } },
  upsert: true,
  new: true,
})
```

### updateMany

- the option document is not required
- db.<collection>.updateMany(<filter>, <update>, <option>)
- note that this operation is not all-or-nothing (if the operation fails, the operation does not roll back updates)
- in this case some documents might be updated, you can run the updateMany operation again (if the update is idempotent)
- lacks isolation, updates are visible as soon as they are performed, so it might be not suitable for some use case

```bash
db.books.updateMany(
  { publishedDate: { $lt: new Date("2019-01-01") } },
  { $set: { status: "LEGACY" } }
)
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 351,
  modifiedCount: 351,
  upsertedCount: 0
}

db.birds.updateMany(
  { $or: [ { common_name: 'Blue Jay' }, { common_name: 'Grackle' }] }, 
  { $set: { last_seen: ISODate('2022-01-01') }}
)
```

### deleteOne and deleteMany

- `deleteOne()` accepts a filter document and an optional options document
- not if the filter is not returning only one document, it will just delete only one of the ones matching the filter

```bash
db.podcasts.deleteOne({ _id: Objectid("6282c9862acb966e76bbf20a") })
{ acknowledged: true, deletedCount: 1 }
```

```bash
db.podcasts.deleteMany({category: “crime”})
{ acknowledged: true, deletedCount: 3 }
```

### Cursor methods

- sort
    - didnt give an error if in the sort you specify an unknown field
- count
- limit

```bash
# alphabetically from A to Z and then a to z, this can be changed in the options part of the sort
db.companies.find({ category_code: "music" }).sort({ name: 1 });
db.companies.find({ category_code: "music" }).sort({ name: 1, _id: 1 });
db.companies
  .find({ category_code: "music" })
  .sort({ number_of_employees: -1, _id: 1 })
  .limit(3);
```

### Projections

- db.collection.find( <query>, <projection> )
- inclusion & exclusion statement can't be combined in the projections (_id field exception)
- you can also use subfields in the projections but put into quotes

```bash
// Return all restaurant inspections - business name, result, and _id fields only
db.inspections.find(
  { sector: "Restaurant - 818" },
  { business_name: 1, result: 1 }
)
// The _id field is included by default, it can be suppressed by setting its value to 0 in any projection
// Return all restaurant inspections - business name and result fields only
db.inspections.find(
  { sector: "Restaurant - 818" },
  { business_name: 1, result: 1, _id: 0 }
)
```

### CountDocuments

db.collection.countDocuments( <query>, <options> )

- options is optional to specify the counting behaviour
- with no argument counts all documents
- accepts queries that use operators, like $elemMatch or $lt

```bash
db.trips.countDocuments({ tripduration: { $gt: 120 }, usertype: "Subscriber" })
```

### Indexes

- store small portion of the data, ordered and easy to search efficiently
- used to speed up queries, reduce disk I/O, reduces resources required, support equality matches, range based queries
  and return sorted results
- without indexes MongoDB needs to read all the documents in the collection
- needs to store the result in memory to sort
- the index could contain all the information for the query, this case not need to read the document at all
- by default, all collections have a single field index on the `_id` field
- every query should use an index
- indexes come with a write performance cost, the index structure also needs to be updated for a given write operation
- we need to make sure all indexes are being used, otherwise we should delete unused indexes

`Single Field index` - includes one field
`Compound indexes` (2 to 32 fields) - includes more than one field
both index types can be `Multikey index`

- include an array field
- the array can hold nested objects or other field types
- in a compound index only one of fields can be an array

```bash
// create an index on the name field ascending
db.customers.createIndex({name:1})
// any inserts or updates including duplicated values in the collection for the index field/s will fail.
// MongoDB only creates the unique index if there is no duplication in the field values for the index field/s.
db.customers.createIndex({email:1}, {unique:true}) 
```

`Compound indexes`

- The order of the fields matters when creating the index and the sort order (to avoid sorting in memory).
- Recommended: `Equality, Sort, Range`
    - Equality: field/s that matches on a single field value in a query
    - Sort: field/s that orders the results by in a query
    - Range: field/s that the query filter in a range of valid values

Example:

```bash
db.customers.createIndex({active:1, birthdate:-1,name:1})

// Queries using the index:
db.customers.find({active:true}).sort({birthDate:-1})
db.customers.find({birthdate: {$gte:ISODate("1977-01-01")},{active: true}})

// Queries cannot use the index:
db.customers.find({birthdate: {$gte:ISODate("1977-01-01")}
db.customers.find({}).sort({birthdate:1})
```

Example:

```bash
// query:

db.customers.find({birthdate: { $gte:ISODate("1977-01-01") }, active:true})
  .sort({ birthdate:-1, name:1})
  
// efficient indexes:
db.customers.createIndex({ active:1, birthdate:-1, name:1})
db.customers.createIndex({ active:1, birthdate:1, name:-1}) -- this will also work
```

View indices:

```bash
db.customers.getIndexes()
[
   {
      "v" : 2,
      "key" : { "_id" : 1 },
      "name" : "_id_"
   },
   {
      "v" : 2,
      "key" : { "borough" : 1 },
      "name" : "borough_1",
      "hidden" : true
   }
]
```

### explain

- The `IXSCAN` stage indicates the query is using an index and what index is being selected.
- The `COLLSCAN` stage indicates a collection scan is perform, not using any indexes.
- The `FETCH` stage indicates documents are being read from the collection.
- The `SORT` stage indicates documents are being sorted in memory.

```bash
// without index
db.accounts.explain().find({account_holder: "Puja Barbier"})
winningPlan: {
      stage: 'COLLSCAN',
      filter: { account_holder: { '$eq': 'Puja Barbier' } },
      direction: 'forward'
},
db.accounts.explain().find({account_holder: "Puja Barbier"}, {account_holder:1})
winningPlan: {
      stage: 'PROJECTION_SIMPLE',
      transformBy: { account_holder: 1 },
      inputStage: {
        stage: 'FETCH',
        inputStage: {
          stage: 'IXSCAN',
          keyPattern: { account_holder: 1 },
          indexName: 'account_holder_1',
          isMultiKey: false,
          multiKeyPaths: { account_holder: [] },
          isUnique: false,
          isSparse: false,
          isPartial: false,
          indexVersion: 2,
          direction: 'forward',
          indexBounds: { account_holder: [ '["Puja Barbier", "Puja Barbier"]' ] }
        }
      }
}
db.accounts.explain().find({account_holder: "Puja Barbier"}, {account_holder:1, _id:0}})
// index covers the query
winningPlan: {
      stage: 'PROJECTION_COVERED',
      transformBy: { account_holder: 1, _id: 0 },
      inputStage: {
        stage: 'IXSCAN',
        keyPattern: { account_holder: 1 },
        indexName: 'account_holder_1',
        isMultiKey: false,
        multiKeyPaths: { account_holder: [] },
        isUnique: false,
        isSparse: false,
        isPartial: false,
        indexVersion: 2,
        direction: 'forward',
        indexBounds: { account_holder: [ '["Puja Barbier", "Puja Barbier"]' ] }
      }
    }
```

### Deleting indices

- deleting indices which are not needed since it causes write performance issues
- before deleting hide the index, to avoid recreating accidentally removed indices because it takes time and resources
- hidden indices are not used in the query but continued to be updated, you can assess the performance of queries and
  unhide the index if needed
- unhiding the index is much faster than recreating it.

```bash
db.restaurants.hideIndex( { borough: 1, ratings: 1 } ); // Specify the index key specification document
db.restaurants.hideIndex( "borough_1_ratings_1" );  // Specify the index name
db.restaurants.unhideIndex( { borough: 1, city: 1 } );  // Specify the index key specification document
db.restaurants.unhideIndex( "borough_1_ratings_1" );    // Specify the index name
```

- use compound indices, below the `username_1` is redundant

```bash
find({username:'Joe'})
find({username:'Joe', active:true})

indices:
username_1
username_1_active_1
```

- drop index by key or name

```bash
db.customers.dropIndex({active:1, birthdate:-1, name:1}}
db.customers.dropIndex(active_1_birthdate_-1_name_1)
db.customers.dropIndexes() // delete all the indexes from a collection, with the exception of the default index on _id.
db.customers.dropIndexes['index1name', 'index2name', 'index3name'] // drop specific indexes
```

### MongoDB Logging Basics

#### MongoDB Logs in Atlas

- Downloading feature only available for M10+ or above clusters
- Downloading logs requires the "Project Data Access Read Only” (GROUP_DATA_ACCESS_READ_ONLY) or greater
- `atlas project users list -o json`
- download the mongod log file for the past 30 days from the primary node
- `atlas logs download uml3-shard-00-00.xwgj1.mongodb.net mongodb.gz`
- `gunzip mongodb.log.gz`

#### MongoDB Logs in Self-managed deployment

- MongoDB log destinations:
    - log file (default), default location `/var/log/mongodb/mongod.log`
        - `sudo head -5 /var/log/mongodb/mongod.log` (access the log file) or user added to `mongodb` user group
        - `systemLog.path` in the `/etc/mongod.conf` or `--logpath` of mongod process
    - syslog
    - stdout

- show recent global log messages from the RAM cache in mongosh use, `show log`

```bash
show log global // db.adminCommand( { getLog:'global'} )
show log startupWarnings // db.adminCommand( { getLog:'startupWarnings'} )
```

#### MongoDB log events

- `mongod.log` file as structured JSON
    - information what is taking place in the database
    - `s` severity field, `F`, `E`, `W`, `I`, `D` (D1-D5)
    - `c` component field, `COMMAND`, `ACCESS`, `STORAGE`, `INDEX`, `NETWORK`, `REPL`, `CONTROL`
    - `ctx` context field, operation thread
    - `msg` field, generated by the component originator
    - `attr` attribute field with more information
    - `tags` some log messages have this property which is an array of strings, you can use for
      filtering (`show log startupWarnings`)

- example of log messages:
    - OS-level warnings
        - ex: `vm.max_map_count` is too low
    - authorization attempts
        - user attempt to modify or access a resource that they not have been granted access to
        - `c`: `ACCESS`
    - replica set elections
        - `c`: `REPL`
        - `msg`: 'Replica set state transition'

#### MongoDB server log customizations

- example: record slow operations
- `slowms` (default is `100`) (self-managed or M10+ Atlas clusters)
    - defines the maximum amount of time for an operation to be complete before it's considered slow
    - any operation above this threshold will be written to the log
- Set it 3 ways
    - `--slowms` parameter of `mongod` process
    - `db.setProfilingLevel` in the `mongosh`
    - `slowOpsThreshold` in the `mongod.conf`
- profiling can have a negative impact on performance and disk space

```bash
// 0 for disable profiling
// 1 profiling operations that take longer than the threshold
// 2 profiling all operations
db.setProfilingLevel(0, { slowms: 30 })
db.getProfilingStatus();
sudo grep "Slow query" /var/log/mongodb/mongod.log | jq
// check durationMillis
```

- increase verbosity of the logs
- you can set verbosity levels for each component
- you can set a global verbosity level `db.setLogLevel()`

```bash
db.setLogLevel(1, "index");
db.getLogComponents().index;
```

- this is not supported in Atlas clusters

```bash
// /etc/mongod.conf
systemLog:
  verbosity: 1
 
// set the verbosity level for a single component
systemLog:
  ...
  // this will show debug messages for index builds, index drops (entries with 's':'D1')
  component:
    index:
      verbosity: 1  
```

#### MongoDB server log rotation and retention

- process of maintaining a log's size (automatically or manually)
- the goal is to prevent logs from growing without bounds
- Atlas
    - retains from all nodes log messages for 30 days
    - to access logs your user needs this role: 'Project Data Access Read Only' role
    - feature is available on M10+ clusters
- Self-managed
    - retained indefinitely, unless:
        - `sudo kill -SIGUSR1 $(pidof mongod)`
        - `db.adminCommand( { logRotate : 1 } )`
- two types:
    - `rename` (MongoDB's default method)
        - renames log with UTC timestamp
        - opens a new log
        - closes the old log
    - `reopen`
        - used in combination of `logrotate` linux service (required `logappend` option)
- MongoDB recommends you to automate log rotation
- performance issues if both the log files and data files are on the same disk

### MongoDB Database Administrator Tools

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

- [mongodump](https://www.mongodb.com/docs/database-tools/mongodump/)
  - mongodump <options> <connection-string>
  - not suitable for large deployments (for those use OpsManager, Cloud Manager)
  - standalone / replica set but not shared clusters (doc says there is also possible with restrictions)
  - the dump contain index data --> restore time can be longer

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

- [mongorestore](https://www.mongodb.com/docs/database-tools/mongorestore/)
- [bsondump](https://www.mongodb.com/docs/database-tools/bsondump/)
- [mongoimport](https://www.mongodb.com/docs/database-tools/mongoimport/)
- [mongoexport](https://www.mongodb.com/docs/database-tools/mongoexport/)
- [mongostat](https://www.mongodb.com/docs/database-tools/mongostat/)
- [mongotop](https://www.mongodb.com/docs/database-tools/mongotop/)
- [mongofiles](https://www.mongodb.com/docs/database-tools/mongotop/)

### Self-Managed Server Administration

-- TODO

### MongoDB Database Metrics & Monitoring

#### Core Metrics

- What we should monitor?
    - `Query targeting`
        - measures read efficiency, ideal ration is 1, every document scanned was returned
        - very high ratio impacts performance
    - `Storage`
        - writes are refused at capacity
    - `CPU utilization`
        - prolonged high CPU usage can lead to operation delays
        - optimize query performance with indexes
    - `Memory utilization`
        - MongoDB recommends the system to be sized to hold all indexes
    - `Replication lag`
        - measures delay between the primary and secondardy (expressed in seconds)
        - high value negatively impacts elections and distributed read consistency
- What is the baseline value?
    - establish by sampling metrics during steady workload
- What is an acceptable burst value?
    - normal to have occasional spikes
    - excessive spiking or sustained spikes could indicate an issue
- What is out of range value?
    - for Query Targeting a very high ratio
    - for Replication lag: a secondary is unable to keep up with the primary
    - for rest of metrics: resource exhaustion, 90% or above

#### More metrics

- `Opcounters`
    - number of operations per second run on a MongoDB process
    - MongoDB tracks: command, query, insert, delete, update and getMore
- `Network traffic`
    - bytesIn - displays the average rate of physical bytes (after any wire compression) sent to the database server per
      second over the selected sample period.
    - bytesOut - displays the average rate of physical bytes (after any wire compression) sent from the database server
      per second over the selected sample period.
    - numRequests - displays the average rate of requests sent to the database server per second over the selected
      sample period.
- `Connections`
    - total number of open connections
    - excessive connections can affect system performance
- `Tickets available`
    - nr of concurrent read and write operations available to the MongoDB storage engine
    - when available tickets drop to 0, other operations must wait until one of the running operations completes and
      frees up the ticket
    - by default is 128 tickets

#### View and analyse metrics

- `Metrics Tab Panel`
    - Free/Shared Clusters
        - Connections, Network, Opcounters, Logical Size
    - M10+ Clusters
        - More than 40 metrics
- `Real-Time Performance Panel`
    - only for M10+ clusters
- `Atlas CLI`

```bash
atlas metrics processes <hostname:port> <options>
```

#### Configuring alerts

- different alerts at `Organization` and `Project` levels
- (focus was on this one) You must have the `Project Owner` role to configure `Project` level alerts
- Alerts can be configured for any metric across all cluster tiers, however shared-cluster tiers only trigger alerts
  related to the supported metrics in those clusters
    - `Connections`
    - `Logical size`
    - `Opcounters`
    - `Network`
- projects are created with a set of default alert settings

```bash
$ atlas alerts settings list
$ atlas alerts settings create
$ atlas alerts settings update
$ atlas alerts settings delete
```

#### Respond to alerts

```bash
// view alerts
// An alert’s status will only change to CLOSED once the condition that triggered the alert is resolved.
$ atlas alerts list --status OPEN --output json
// acknowlege an alert, the alert is not fired until the acknowledgment period ends or the error condition is resolved or the alert is manually unacknowledged
$ atlas alerts acknowledge <alertId> --until '2028-01-01T00:00:00.000Z' --comment <comment>
// unacknowledge an alert
$ atlas alerts unacknowledge <alertId>
```

#### MongoDB Atlas Integrations for Monitoring

- Receive Atlas alerts, view and analyse performance metrics
- integrations: Prometheus, DataDog, PagerDuty, etc... (Prometheus and DataDog are only available on M10+ clusters)

#### Self-managed monitoring

- MongoDB recommends MongoDB Cloud Manager to monitor self-managed deployments
- But sometimes is not an option: Use Prometheus + Grafana
- Create a new database user (test) with the clusterMonitor role

```bash
db.createUser({user: "test",pwd: "testing",roles: [{ role: "clusterMonitor", db: "admin" },{ role: "read", db: "local" }]})
```

- Create a Service for Percona MongoDB Exporter
- Configure Percona MongoDB Exporter as a Prometheus Target

#### `command line metrics`

- monitor apps like MongoDB Cloud Manager, or Percona Prometheus exporter run this command at regular intervals

##### serverStatus

- serverStatus is a `diagnostic database command` that returns a document that provides an overview of the database’s
  state, including connection metrics.

```bash
db.runCommand({ serverStatus: 1 })
db.runCommand( { serverStatus: 1 } ).connections
{ current: 5, available: 495, totalCreated: Long('37') }
```

##### currentOp

- currentOp is an `administrative command` that returns a document containing information on in-progress operations for
  the mongod instance

```bash
db.adminCommand({ currentOp: true, "$all": true, active: true })
```

##### killOp

- killOp is an `administrative command` that allows us to kill active operations

```bash
db.adminCommand( { killOp: 1, op: <opid>, comment: <any> })
```

### Self-Managed Backup & Recovery

- `Backup plan`
    - Important:
        - Keep business functional during an unforeseen event
        - Satisfying regulatory obligations
    - How to back up data
    - How often data is backed up
    - How long to retain backup data
    - Where to store backup data
    - What tools you need to use `file system snapshots` or included tools like `mongodump`, `mongorestore`, or others
- `Recovery Point Objectives` (RPO)
    - Maximum acceptable amount of data loss that a business is willing to tolerate in the event of a disruption
      expressed in an amount of time
    - Example:
        - a business decides that 2 hours of data loss is acceptable
        - they experience an outage at 12 PM
        - the business needs to recover all data that was recoreded before 10 AM

- `Recovery Time Objectives` (RTO)
    - Maximum amount of time that a business can tolerate after an outage before the disruption makes normal business
      operations intolerable
    - Example
        - a business has an RTO of 3 hours
        - all systems must be running by 3 hours after an outage at most

- `File System Snapshot`
    - can be created on all size systems
    - a snapshot volume is point-in-time, read-only view of the source volume
    - a volume is a container with a filesystem that allows to store and access data
    - snapshots can be created with different tools
        - Logical Volume Manager for Linux
        - MongoDB Ops Manager
        - MongoDB Atlas
        - Most cloud providers have their own tools as well
    - Before taking a snapshot we need the database to be locked with
        - `fsyncLock()` - forces MongoDB to flush all pending write operations to disk
        - locks the entire instance to prevent additional writes until the `fsyncUnlock()` command
    - consider isolating your MongoDB deployment to prevent very large snapshot volume archives
    - important to create a snapshot of your entire deployment
        - for example `journal` might be stored somewhere else
        - the `journal` is a sequential binary transaction log that is use to bring the database into valid state in
          case of a hard shutdown
    - how to extract data from snapshot
        - `Snapshot volume archive`
            - complete copy of the source volume, plus and change that occured while the snapshot was being created (
              linux `dd` utility)
            - could be large
        - `Filesystem archive`
            - mounting the snapshot volume and using filesystem tools such as `tar` to archive the actual files
            - this is smaller than the previous option

- `Snapshot volume archive`
    - example: we have physical volume, and a vg0 `volume group` and a mdb `logical volume` mounted to the data files
      located at `/var/lib/mongodb`
    - It’s a good idea to store your backups on a separate server from the MongoDB deployment. This allows you to easily
      access your backups in case your MongoDB deployment server becomes unavailable. It also allows you to save server
      resources for your deployment server.

```bash
// lock the database
mongosh
db.fsyncLock();
exit
// create a snapshot volume
sudo lvcreate --size 100M --snapshot --name mdb-snapshot /dev/vg0/mdb;
// to check that the snapshot was created
sudo lvs
// unlock the database
mongosh
db.fsyncUnlock(); // this is important otherwise no writes are possible
exit
// archive the snapshot
sudo dd status=progress if=/dev/vg0/mdb-snapshot | gzip > mdb-snapshot.gz
// restore the archived snapshot
// create a new logical volume named mbd-new
sudo lvcreate --size 1G --name mdb-new vg0;
// extract the snapshot and write it to the new logical volume:
gzip -d -c mdb-snapshot.gz | sudo dd status=progress of=/dev/vg0/mdb-new
// stop the MongoDB service before mounting to the source directory:
sudo systemctl stop -l mongod; sudo systemctl status -l mongod;
// Delete any existing MongoDB data files. This is for demonstration purposes to show how the entire deployment is restored.
sudo rm -r /var/lib/mongodb/*
// Next, unmount the MongoDB deployment so that you can mount the newly restored logical volume in its place.
sudo umount /var/lib/mongodb
// Mount the restored logical volume on the MongoDB database directory:
sudo mount /dev/vg0/mdb-new /var/lib/mongodb
// start the MongoDB service and connect to the deployment
sudo systemctl start -l mongod; sudo systemctl status -l mongod;
mongosh
show dbs
```

- `Filesystem archive`
    - we use the Linux `Logical Volume Manager` and the `tar` utility
    - example: we have physical volume, and a vg0 `volume group` and a mdb `logical volume` mounted to the data files
      located at `/var/lib/mongodb`

```bash
// lock the database
mongosh
db.fsyncLock();
exit
// create a snapshot volume
sudo lvcreate --size 100M --snapshot --name mdb-snapshot /dev/vg0/mdb;
// to check that the snapshot was created
sudo lvs
// unlock the database
mongosh
db.fsyncUnlock(); // this is important otherwise no writes are possible
exit
// archive the snapshot
mkdir /tmp/mongodbsnap
// mount the snapshot volume taken previously as read-only
sudo mount -t xfs -o nouuid,ro /dev/vg0/mdb-snapshot /tmp/mongodbsnap/
// use tar to create a new archive of all the files in the mongodbsnap directory
sudo tar -czvf mdb-snapshot.tar.gz -C /tmp/mongodbsnap/ .
// restore the archived snapshot
sudo mkdir /mdb
sudo tar -xzf mdb-snapshot.tar.gz -C /mdb
sudo systemctl stop -l mongod; sudo systemctl status -l mongod;
sudo chown -R mongodb:mongodb /mdb 
// set it in the /etc/mongod.conf
storage:
  dbPath: /mdb   
// start the MongoDB service and connect to the deployment
sudo systemctl start -l mongod; sudo systemctl status -l mongod;
mongosh
show dbs
```

- `mongodump`
    - not ideal for large systems
    - create a backup of a replica set
    - well suited for small deployments and for seeding data
    - should not be used for sharded clusters
    - the result will be BSON file which can be compressed
    - for `production quality backup and recovery` use
        - MongoDB Atlas
        - MongoDB Cloud Manager
        - MongoDB Ops Manager

```bash
// Create a User with the Backup Role
db.createUser({ user: "backup-admin", pwd: "backup-pass", roles: ["backup"]})

// `oplog` option captures incoming write operations during the mongodump operation.
// the result provides and effective point-in-time (when the backup is completed) snapshot of the deployment
// `gzip` option compresses the output file.
// `archive` option is used to specify the file location for the dump file.
//  The read preference is also set in the connection string to reduce any performance impact.
mongodump \
--oplog \
--gzip \
--archive=mongodump-april-2023.gz  \
“mongodb://backup-admin@mongod0.repleset.com:27017,mongod1.replset.com:27017,mongod2.replset.com:27017/?authSource=admin&replicaSet=replset&readPreference=secondary”


// create a backup for `neighborhoods` collection of the `sample_restaurants` database
// `oplog` option cannot be used in this case
mongodump \
--collection=neighborhoods \
--gzip \
--archive=mongodump-neighborhoodss-2023.gz \
"mongodb://backup-admin:@mongod0.repleset.com:27017,mongod1.replset.com:27017,mongod2.replset.com:27017/sample_restaurants?authSource=admin&replicaSet=replset"
```

- `mongorestore`
    - restore a replica set
    - is useful for seeding smaller systems
    - we must ensure that the source and target major versions are the same
    - same version of mongorestore as the version of mongodump

```bash
// Create a User with the restore role
db.createUser({ user: "restore-admin", pwd: "restore-pass", roles: ["restore"] })
// Use mongorestore to Restore a Database
// The --drop option removes any existing collections from the database.
// The --gzip option is used to restore from a compressed file.
// The --oplogReplay option replays the oplog entries from the oplog.bson file.
// The --noIndexRestore option is used to reduce the impact on the system. You will need to recreate the indexes later
// The --archive option is used to specify the file location of the dump file. I

mongorestore \
--drop \
--gzip \
--oplogReplay \
--noIndexRestore \
--archive=mongodump-april-2023.gz \
“mongodb://restore-admin@mongod0.repleset.com:27017,mongod1.replset.com:27017,mongod2.replset.com:27017/?authSource=admin&replicaSet=replset”
```

### Self-Managed Upgrades & Maintenance

- MongoDB minimizes downtime by leveraging replica sets to perform rolling maintenance
- Requiring maintenance:
    - Upgrading to a new version of MongoDB
    - Upgrading drivers
        - Java Sync driver check compatibility:
            - https://www.mongodb.com/docs/drivers/java/sync/current/compatibility/
        - Java Reactive Streams Driver:
            - https://www.mongodb.com/docs/languages/java/reactive-streams-driver/current/
        - Occasionally, early driver upgrades can cause a regression in performance. After upgrading, it’s important to
          thoroughly test your application before pushing it to a production environment.
    - Security updates to the operating system
    - Changes to replica set membership
    - Upgrading operating system
- Atlas simplifies the process of rolling maintenance by automating it for us

- `serverApi` field enable the `Stable API` feature, which allows upgrading your MongoDB server at will while ensuring
  behaviour changes between MongoDB versions will not break your application
-

```bash
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
```

- Upgrade MongoDB version
    - upgrades that cross major releases must be done incrementally
    - In MongoDB replica sets, each node is upgraded one at a time.
    - You only have to gracefully shut down each node, which doesn’t require removing it from the replica set.
    - MongoDB upgrade does not require scheduled downtime.
- Upgrade MongoDB version steps: (for example: upgrade from 7.0.x to 8.0.x)
    - Check version of MongoDB database: `db.version()`. Recommended to have the latest patch installed here.
    - Confirm the Feature Compatibility Version of each member of the replica set
        - `db.adminCommand( { getParameter: 1, featureCompatibilityVersion: 1 } ).featureCompatibilityVersion`
        - The feature compatibility version enables or disables the features that persist data and are incompatible with
          earlier versions of MongoDB.
    - Confirm the state of each member
        - Ensure that no replica set member is in the ROLLBACK or RECOVERING state. If it’s not clear what the state of
          the member is, the risk of corrupting or losing data rises significantly.
    - Determine the oplog window
        - `db.printReplicationInfo()` (log length start to end)
        - oplog entries are time-stamped
        - The oplog window is the time difference between the newest and the oldest timestamps in the oplog.
        - If a secondary node loses connection with the primary, it can only use replication to sync up again if the
          connection is restored within the oplog window.
        - Gives up rough estimate how much time we have to perform maintenance on a single node
    - Confirm Secondaries’ Replication Lag
        - `rs.printSecondaryReplicationInfo()`
    - Gracefully shut down and upgrade secondaries one by one
    - Elect a New Primary
        - Confirm you are logged to a primary: `print({CurrentNode: rs.hello().me, Primary: rs.hello().primary})`
        - Call for an election to change the primary: `rs.stepDown()`
    - Upgrade Primary
    - Test applications with the new version and if you find no error continue
    - Set the Feature Compatibility Version
        - Connect to your replica set with MongoDB shell and
          issue: `db.adminCommand( { setFeatureCompatibilityVersion: "8.0" } )`

### ENABLING AUTHENTICATION FOR A SELF-MANAGED MONGODB DEPLOYMENT

```bash
$ mongod --config ~/projects/mongodb/learning-mongodb/mongod.conf 
```

```bash
security:
   authorization: enabled
```

### ESTABLISHING AUTHORIZATION FOR A SELF-MANAGED MONGODB DEPLOYMENT

With `mongosh` you will be still able to connect using the `localhost` exception as long as you didn't create any users
or roles

```bash
$ use admin
$ db.createUser(
{
    user: "globalUserAdmin",
    pwd: passwordPrompt(),
    roles: [
        { role: "userAdminAnyDatabase", db: "admin" }
    ]
    }
)
$ quit()
$ mongosh --username globalUserAdmin
admin
$ use admin
$ db.getUsers()
{
  users: [
    {
      _id: 'admin.globalUserAdmin',
      userId: UUID('7c23f6c7-f9c1-4d9c-b713-fa7d67c0f345'),
      user: 'globalUserAdmin',
      db: 'admin',
      roles: [ { role: 'userAdminAnyDatabase', db: 'admin' } ],
      mechanisms: [ 'SCRAM-SHA-1', 'SCRAM-SHA-256' ]
    }
  ],
  ok: 1
}
```

Best practice to create all users in the `admin` database
example roles, you can assign to users during creation, or updating the user

```bash
read
readWrite
dbAdmin
dbOwner
readAnyDatabase
userAdminAnyDatabase
```

```bash
db.createUser(
  {
    user: "analystUser",
    pwd: passwordPrompt(),        
    roles: [
      { role: "read", db: "sample_analytics" },
    ]
  }
)

db.createUser(
  {
    user: "analystUser2",
    pwd: passwordPrompt(),        
    roles: [
      { role: "readWrite", db: "sample_analytics" },
    ]
  }
)
```

### Connect with a user to the admin database

```bash
$ mongosh --username analystUser admin
analystUser
$ mongosh --username analystUser2 admin
analystUser2
```

#### Connect directly to a database

```bash
mongosh "mongodb://analystUser@localhost:27017/sample_analytics?authSource=admin"
```

```bash
use sample_analytics
db.accounts.insertOne({
    "account_id": 470650,
    "limit": 10000,
    "products": [
        "CurrencyService",
        "Commodity",
        "InvestmentStock"
    ]}
)
```

#### Revoke roles from user

```bash
db.revokeRolesFromUser(
    "analystUser2",
    [
      { role: "readWrite", db: "sample_analytics" }
    ]
)
```

```bash
db.createUser(
  {
    user: "financeUser",
    pwd: "QmJWh4P8Gk5v4XDa8F79",    
    roles: [
      { role: "readWrite", db: "sample_analytics" },
      { role: "read", db: "sample_supplies" }
    ]
  }
)
```

### MongoDB connection string

- Standard format
    - used to connect to standalone clusters, replica sets, or sharded clusters

```bash
mongodb://
```

- DNS Seed list format
    - provides a DNS server list to our connection string
    - gives more flexibility of deployment
    - ability to change servers in rotation without reconfiguring clients

- The Atlas used a DNS Seed list connection format:
- **srv** section sets the TLS security option to true
- host and optional port number (27017 if not specified)

- Connect with MongoDB Shell:

```bash
mongosh "mongodb+srv://mdb-training-cluster.swnn5.mongodb.net/myFirstDatabase" --apiVersion 1 --username MDBUser
```

- Connect your application:

```bash
mongodb+srv://MDBUser:<password>@mdb-training-cluster.swnn5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
```

- Connect using MongoDB Compass

```bash
mongodb+srv://MDBUser:<password>@mdb-training-cluster.swnn5.mongodb.net/test
```

### SECURITY AUDITING IN MONGODB

- MongoDB Enterprise has this feature

- Audit output destinations:
    - syslog - JSON output
    - console - JSON output
    - file - JSON or BSON

`mongod.conf`

```bash
auditLog:
  destination: file
  format: JSON
  path: /var/log/mongodb/auditLog.json
```

--auditDestination command line for mongod

Failed authentication

```bash
$ mongosh localhost:27017/admin --username badUser --password incorrectPassword
```

```bash
$ tail /Users/altfatterz/apps/mongodb/audit/auditLog.json | jq .
```

```json
{
  "atype": "authenticate",
  "ts": {
    "$date": "2024-08-16T17:00:33.857+02:00"
  },
  "uuid": {
    "$binary": "SCQLbHpOTMil/2Rz8PRTiw==",
    "$type": "04"
  },
  "local": {
    "ip": "127.0.0.1",
    "port": 27017
  },
  "remote": {
    "ip": "127.0.0.1",
    "port": 59663
  },
  "users": [],
  "roles": [],
  "param": {
    "user": "badUser",
    "db": "admin",
    "mechanism": "SCRAM-SHA-1"
  },
  "result": 11
}
```

### Replication

https://www.mongodb.com/docs/manual/replication/

- replication is the process of storing multiple copies of the same data on different servers
- this provides: fault tolerance and high availability
- high availability: making sure your data is continuously accessible
- replica set / replica set member (3, 5, 7 mongod instances)
- we can have a maximum of 50 members with a maximum of 7 voting members
- replica set contains one primary node and multiple secondary nodes
- primary is the only one which receives write operations, ends up in primary's `oplog` which is replicated to
  secondaries
- by default primary also handles read operations, can be changed that secondary nodes can also handle reads
- Election: if primary goes down and election is initiated which determines an new primary for the replica set
    - during election the voting secondary nodes cast votes for the secondary that is most suitable to become the new
      primary
    - the member that receives the majority votes from voting members is the winner
    - can be also initiated by:
        - adding an new node to the replica set
        - initiating a replica set
        - performing replica set maintenance with `rs.stepDown()` or `rs.reconfig()`
        - if secondary members loose connection to primary for more than the configured timeout (10 seconds by default)
    - each member of a replica set can initiate and vote in an election unless is configured not to (priority set to 0)
- once the old primary comes available again, joins as a secondary, it catches up while it was unavailable
- failover initiated automatically when the primary node of the replica set becomes unavailable
- Important to have odd number members in a replicaset in order to make sure a primary will be elected in the event of a
  network partition
- if a member has higher priority value than the other members it has a greater chance of becoming the primary
- arbiters are usually introduced if there is an even number of voting members. Arbiters also do not hold any data.
- By default, a three-member replica set has three voting members.
- Secondaries replicate the primary's oplog and apply the operations to their data sets asynchronously.
- `oplog`
    - is a capped collection (behaves similarly to a ring buffer)
    - the oldest information is overwritten with new information once it reaches its capacity
    - oplog entries are idempotent
    - by default the storage for oplog it 5% of the available disk space and upper limit of 50 GB
    - replication lag (replLag see in `rs.printSecondaryReplicationInfo()`) cause:
        - network latency
        - disk throughput
        - long running operations
        - not having the proper write concern (ex with unacknowledged writes, secondaries might not be able to catch up
          fast)
- a little replication lag is expected, but when is becoming excessive it can cause problems:
    - if secondary cannot catch up it can fall into `recovering state`
    - in `recovering state` the member is eligible to vote but cannot accept read operations
    - to bring the member to up-to-date it has to start an `initial sync`
    - `initial sync` is the process of copying all of the data, including the oplog from a replica set member
    - `initial sync` is expensive in terms of network / disk / CPU

```bash
$ use local
# oplog.rs -- collection
db.oplog.rs.find()
# query the oplog with namespace (ns) and sort by natural descending order.
db.oplog.rs.find({"ns" : "sample_supplies.sales"}).sort({$natural: -1}).limit(5)
db.oplog.rs.find({"ns" : "sample_training.grades"}).sort({$natural:-1}).limit(1)

  {
    op: 'd',
    ns: 'sample_training.grades',
    ui: UUID('8d1381cd-6dd3-466f-aa0d-11af16c42d58'),
    o: { _id: ObjectId('56d5f7f1604eb380b0da5ef5') },
    ts: Timestamp({ t: 1724068592, i: 221 }),
    t: Long('1'),
    v: Long('2'),
    wall: ISODate('2024-08-19T11:56:32.354Z')
  },
```

```bash
# print primary oplog
$ rs.printReplicationInfo()
# print secondary oplog
$ rs.printSecondaryReplicationInfo()
```

- `write concern` describe how many data-bearing members acknowledge a write before is considered complete
- higher levels of acknowledgment produce a stronger durability guarantee
- durability guarantee means that data that has been committed will not be lost in the event of a failover
- by default `write concern` is set to `majority` (majority of the members is needed)
- `write concern` <number> - means how many members in the replica set need to acknowledge the write
- `write concern` set to 1 - means only the primary should acknowledge the write
- `write concern` set to 0 - means that members are not required to acknowlege the write

```bash
$ db.cats.insertOne({ name: "Mac", color: "black", age: 6 }, { writeConcern:
{ w: "majority" , wtimeout: 3000 } });
```

```bash
$ db.users.insertOne({ name: 'Jade', age: 20, "last_updated": new Date() }, { writeConcern: { w: 4 } })
MongoWriteConcernError[UnsatisfiableWriteConcern]: Not enough data-bearing nodes
```

```bash
$ db.users.insertOne({ name: 'Jade', age: 20, "last_updated": new Date() }, { writeConcern: { w: "majority" } })
MongoWriteConcernError[UnsatisfiableWriteConcern]: Not enough data-bearing nodes
```

- `read concern`
    - allow your application to sepecify the durability guarantee for the documents returned by the read operation
    - choose between returning the most recent data or returning data committed to the majority of the members
    - possible values:
        - `local` (by default, returns most recent data)
        - `available` (same as the local read concern for replica sets)
        - `majority` (returns only data that has been acknowledged as written to a majority of members in a replica set)
        - `linearizable` (reflects all successful, majority acknowledged writes that completed before the start of the
          read operation)
    -

- Change default read and write concern for all users:

```bash
$ # use the adminCommand() to issue a command against the admin database.
db.adminCommand({
    setDefaultRWConcern : 1, # specifies the command that’s being executed, always set to 1
    defaultReadConcern: { level : "majority" },
    defaultWriteConcern: { w: "majority" }
  })
```

- `read preference` - describe which members of a replica set you want to send read operations to
- possible values:
    - `primary` (by default)
    - `primaryPreferred` (read from primary, but if not available for some reason, read from a secondary)
    - `secondary` (read from secondary)
    - `secondaryPreferred` (read from secondary, but if not available can go to a primary)
    - `nearest` (direct all your reads to the nearest network ping)
- if you read from secondary, you might read stale data

Ex: we’re reading from the secondary and we set the time limit for how stale our data can be:

```bash
$ mongodb://db0.example.com,db1.example.com,db2.example.com/?replicaSet=myRepl&readPreference=secondary&maxStalenessSeconds=120
```

- deploying a `replica set`

```bash
$ openssl rand -base64 756 > /tmp/keyfile
$ chmod 0400 /tmp/keyfile
$ sudo mkdir -p /etc/mongodb/pki
$ sudo mv /tmp/keyfile /etc/mongodb/pki/keyfile
$ sudo chown -R mongodb /etc/mongodb/pki 
```

`mongod.conf`:

```bash
net: 
  port: 27017
  bindIp: 127.0.0.1, mongod0.replset.com

security:
  keyFile: /etc/mongodb/pki/mongod-keyfile
  authorization: enabled

replication:
  replSetName: mongodb-repl-example 
```

```bash
$ sudo systemctl restart mongod
$ sudo systemctl status mongod
```

```bash
$ rs.initiate({
_id: "mongodb-repl-example",
version: 1,
members: [
  {_id:0, host: "mongod0.replset.com"},
  {_id:1, host: "mongod1.replset.com"},
  {_id:2, host: "mongod2.replset.com"}]
})
{ok: 1}

$ db.createUser({
user:"admin-user",
pwd:"admin-pwd
roles: [
{ role: "root", db: "admin"}
]
})
```

We connect to an entire replica set:

```bash
$ mongosh "mongodb://dba-admin:dba-pass@<server-one-ip:port>,<server-two-ip:port>,<server-three-ip:port>/?authSource=admin&replicaSet=mongodb-repl-example"
$ rs.status()
$ db.getUsers()
$ db.hello()
```

To check the members (returns one document with `members` field)

```bash
$ rs.status()

members: [{
  _id: 0,
  name: "mongod0.replset.com:27017",
  stateStr: "PRIMARY",
  ...
  },
]
```

Initiate an election to see that another node became the primary

```bash
$ rs.stepDown() 
```

- examples to reconfigure a replica set (updating the priority, set tag)

```bash
$ config = rs.conf()
$ config.members[2].priority=10
$ config.members[2].tag = { "location": "Virginia", "provider": "AWS" };
$ rs.reconfig(config)
$ rs.conf().members()
```

- remove a member from a replica set

```bash
$ config = rs.conf()
# from index one please remove 1 element
$ config.members.splice(1, 1)
# another option rs.remove("mongod1.replset.com:27017")
$ rs.reconfig(config)
# Status of a Replica Set
$ rs.status()
# primary field 
$ rs.hello()
```

### Encryption concepts

- transport encryption
    - TLS/SSL is used to encrypt all of MongoDB’s network traffic.
    - available for community or enterprise version
    - MongoDB Atlas TLS is enabled by default and cannot be disabled
    - In self-managed deployment is not enabled by default
    - In sefl-managed environment have TLS certificate for each server in pem format.
- encryption at rest
    - It encrypts data in storage on the server.
    - only enterprise offers and encrypted enterprise option
        - enables you to natively encrypt MongoDB datafiles on disk.
        - only parties with decryption key can decode and read the data
- in-use encryption - protects when the data is in memory
    - Client-Side Field Level Encryption (CSFLE) encrypts data in the client before it's sent to the database.
        - this is basically also at-rest encryption
    - This ensures data is tamper- and read-proof on the server.
    - Available for community or enterprise version
        - MongoDB Community
            - uses explicit encryption
            - must specify encryption logic manually by using the mongodb drivers encryption library
        - MongoDB Enterprise
            - supports automatic encryption in addition to explicit encryption
            - define encrypted fields using JSON Schema, then the driver encrypts / decrypts fields automatically
    - the MongoDB never has access to your most sensitive data in unencrypted form and never has the decryption keys
    - the client gets a keys from a management system end encrypts and decrypts as needed
    - the client only sends encrypted data or queries with encrypted values to the server

### TLS enable

```yaml
net:
  tls:
    mode: requireTLS
    # the file contains both the certificate and the private key
    certificateKeyFile: /etc/tls/mongodb.pem
    # Specify that the server allows invalid TLS certificates (as we are creating our own)
    allowInvalidCertificates: true
    # Specify that the server allows invalid hostnames.
    allowInvalidHostnames: true
replication:
  replSetName: TLSEnabledReplSet  
```

The client with the `root-ca.pem` can validate the certificate presented by the server

```bash
$ mongosh "mongodb://mongod0.replset.com/?tls=true&tlsCAFile=/etc/tls/root-ca.pem"
$ use admin
# Use the rs.initiate() method to create a replica set:
rs.initiate(
  {
     _id: "TLSEnabledReplSet",
     version: 1
     members: [
        { _id: 0, host : "mongod0.replset.com" },
        { _id: 1, host : "mongod1.replset.com" },
        { _id: 2, host : "mongod2.replset.com" }
     ]
  }
) 

$ db.hello().isWritablePrimary
true
```

The prompt will switch to `primary` this indicates that the replica set has been initiated.

```bash
$ $ mongosh "mongodb://mongod0.replset.com,mongod1.replset.com,mongod2.replset.com/?replicaSet=TLSEnabledReplSet&tls=true&tlsCAFile=/etc/tls/root-ca.pem"
```

This should work

```bash
$ mongosh "mongodb://mongod0.replset.com,mongod1.replset.com,mongod2.replset.com/?replicaSet=TLSEnabledReplSet" 
```

This should fail

### tlsUseSystemCA - available for mongod only.

https://www.mongodb.com/docs/manual/reference/parameters/#mongodb-parameter-param.tlsUseSystemCA

Specifies whether MongoDB loads TLS certificates that are already available to the operating system's certificate
authority.

```bash
$ mongod --config /etc/mongod_1.conf --setParameter tlsUseSystemCA=true
```

Other options:

- `--tlsCAFile` parameter
- `tls.CAFile` configuration


