### Install `mongod`

https://www.mongodb.com/docs/manual/installation/

I have the enterprise version into my `~/apps` folder and set the path in my `.zshrc`

```bash
export MONGODB_HOME=~/apps/mongodb-macos-x86_64-enterprise-7.0.9
export PATH="$MONGODB_HOME/bin:$PATH"
```

### Install `Mongo Shell` (mongosh)

https://www.mongodb.com/docs/mongodb-shell

I have the enterprise version into my `~/apps` folder and set the path in my `.zshrc`

```bash
export MONGOSHELL_HOME=~/apps/mongosh-2.2.5-darwin-x64
export PATH="$MONGOSHELL_HOME/bin:$PATH"
```

### Start up `mongod` process:

```bash
$ mkdir ~/apps/mongodb/db
$ mkdir ~/apps/mongodb/log
$ mongod --dbpath ~/apps/mongodb/db --logpath ~/apps/mongodb/log/mongo.log
```

### Start `mongosh`

- it is a Node.js REPL environment
- access to JavaScript
    - variables
    - functions
    - conditionals
    - loops
    - control flow statements

```bash
$ mongosh

Current Mongosh Log ID:	6633a530e3408e2697a514f8
Connecting to:		mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.5
Using MongoDB:		7.0.9
Using Mongosh:		2.2.5
```

Connect to Atlas database:

```bash
$ mongosh "mongodb+srv://demo-cluster.odqjme8.mongodb.net/" --apiVersion 1 --username altfatterz
--- reset password in the console, note it can take a while ---
```

```bash
mongosh "mongodb+srv://<username>:<password>@<cluster_name>.example.mongodb.net"
```

or

```bash
mongosh -u exampleuser -p examplepass "mongodb+srv://myatlasclusteredu.example.mongodb.net"
```

### configure mongosh

1. `config` API with the `config` object - setting will persist between shell session on a per user basis
    - config.get('enableTelemetry')
    - config.set('enableTelemetry', false)
    - config.reset('enableTelemetry')
2. mongosh.conf
    - the changes here are overridden with the `config` API if the same setting is used
    - set options for all users of the shell
    - location depends on the operating system
   ```yaml
   mongosh:
     displayBatchSize: 50
     editor: vim
   ```
3. passing command line arguments
    - example: mongosh --eval "disableTelemetry()"
    - example: mongosh --eval "db.accounts.find().limit(3)" --quiet

- in MongoDB is best practice to store date in `ISODate()`
- to run an external script in mongosh, use the `load()` method.
- Within your script, you can use the `db.getSiblingDB()` method to access a database without having to switch to it in
  mongosh
- load("/Users/altfatterz/projects/mongodb/learning-mongodb/giveMeADate.js")

- The `.mongoshrc.js` file can be used to run code when `mongosh` starts. Put this into user's home directory.
- you can add helper functions
- you can change the prompt

- write query results into a JSON file
- generate seed data and store it in MongoDB database

- we use the fs module to write the results of the query to a file called `customers.json`.

```bash
const customers = db.sales.find({}, {customer: 1, _id: 0})
# customers.json will be created in user's home directory
fs.writeFileSync('customers.json', EJSON.stringify(customers.toArray()), null, 2)
cat customers.json | jq .
```

### Generate Seed data

include it into `fakeUsers.js` and load it using `load("fakeUsers.js")`

```bash
const { faker } = require("@faker-js/faker");
const users = [];
for (let i = 0; i < 10; i++) {
 users.push({
   name: faker.person.fullName(),
   email: faker.internet.email(),
   phone: faker.phone.number(),
 });
}

console.log("Inserting fake users ...");
db.getSiblingDB("test_data").users.insertMany(users);
```

- Load a script into `mongosh` that requires an `npm` package, the `npm` package be installed
    - An option for using an npm package in an external script is to install the package globally and then require it in
      the script.
    - An option for using an npm package in an external script is to install the package in the same directory as the
      script and then require it in the script.

### db.hello

```bash
$ db.hello()

Enterprise test> db.hello()
{
  isWritablePrimary: true,
  topologyVersion: {
    processId: ObjectId('66bcc080a5804700a1fe6cd9'),
    counter: Long('0')
  },
  maxBsonObjectSize: 16777216,
  maxMessageSizeBytes: 48000000,
  maxWriteBatchSize: 100000,
  localTime: ISODate('2024-08-14T14:41:46.542Z'),
  logicalSessionTimeoutMinutes: 30,
  connectionId: 4,
  minWireVersion: 0,
  maxWireVersion: 21,
  readOnly: false,
  ok: 1
}
```

```bash
Atlas atlas-12k22w-shard-0 [primary] sample_airbnb> db.hello()

{
  topologyVersion: {
    processId: ObjectId('66b65c5226d9b738055d3184'),
    counter: Long('6')
  },
  hosts: [
    'ac-hgeddrt-shard-00-00.odqjme8.mongodb.net:27017',
    'ac-hgeddrt-shard-00-01.odqjme8.mongodb.net:27017',
    'ac-hgeddrt-shard-00-02.odqjme8.mongodb.net:27017'
  ],
  setName: 'atlas-12k22w-shard-0',
  setVersion: 63,
  isWritablePrimary: true,
  secondary: false,
  primary: 'ac-hgeddrt-shard-00-02.odqjme8.mongodb.net:27017',
  tags: {
    nodeType: 'ELECTABLE',
    availabilityZone: 'euc1-az1',
    provider: 'AWS',
    workloadType: 'OPERATIONAL',
    diskState: 'READY',
    region: 'EU_CENTRAL_1'
  },
  me: 'ac-hgeddrt-shard-00-02.odqjme8.mongodb.net:27017',
  electionId: ObjectId('7fffffff00000000000002b7'),
  lastWrite: {
    opTime: { ts: Timestamp({ t: 1723646896, i: 56 }), t: Long('695') },
    lastWriteDate: ISODate('2024-08-14T14:48:16.000Z'),
    majorityOpTime: { ts: Timestamp({ t: 1723646896, i: 56 }), t: Long('695') },
    majorityWriteDate: ISODate('2024-08-14T14:48:16.000Z')
  },
  maxBsonObjectSize: 16777216,
  maxMessageSizeBytes: 48000000,
  maxWriteBatchSize: 100000,
  localTime: ISODate('2024-08-14T14:48:16.566Z'),
  logicalSessionTimeoutMinutes: 30,
  connectionId: 211170,
  minWireVersion: 0,
  maxWireVersion: 21,
  readOnly: false,
  ok: 1,
  '$clusterTime': {
    clusterTime: Timestamp({ t: 1723646896, i: 56 }),
    signature: {
      hash: Binary.createFromBase64('/TG0AQDFZwtUmDy8lpNui80NPG8=', 0),
      keyId: Long('7342522140433842178')
    }
  },
  operationTime: Timestamp({ t: 1723646896, i: 56 })
}
```

### Install `MongoDB Compass`

https://www.mongodb.com/try/download/compass

Compass 1.43.0 is installed successfully

Create connections:

```bash
local -> mongodb://localhost:27017
Altas DB -> mongodb+srv://altfatterz:<password>@demo-cluster.odqjme8.mongodb.net/
```

### Install Atlas CLI

```bash
export MONGODB_ATLAS_HOME=~/apps/mongodb-atlas-cli_1.22.0_macos_x86_64
export PATH="$MONGODB_ATLAS_HOME/bin:$PATH"
```

```bash
$ atlas auth login
$ atlas setup
$ atlas clusters list
$ atlas projects list
$ atlas auth logout
```

### Useful MongoDB commands:

```bash
$ show dbs
$ show collections
$ db.<collection>.find()
$ db.<collection>.findOne()
$ db.<collection>.drop()
$ db.<collection>.countDocuments()
$ db.help()
$ db.hello()
```

### MongoDB document model

- documents are displayed in JSON, but stored in BSON
- JSON datatypes: string, array, object, number, boolean, null
- BSON supports additional data types like dates, numbers of different types, and ObjectIds
- https://www.mongodb.com/resources/basics/json-and-bson
- ObjectId is using to create a unique field
- flexible schema
- polymorphic documents (documents in a collection can contain different fields and value types)
- optional schema validation - set contraints on the structure of documents
- every document must include a _id field with a unique value, whether it's included in the inserted document or
  auto-generated by MongoDB.
- collection types:
    - `capped collection`
        - fixed sized collection that support high throughput operations that insert and retrieve documents based on
          insertion order
    - `time series collection`
        - efficiently store sequences of measurements over a period of time
    - `clustered index collection`
        - store documents clusterd by the `_id` cluster key. This provides and index to support lookups on the cluster
          key without the need for a secondary index
- MongoDB stores data in BSON format both internally and over the network
- The MongoDB driver then takes care of converting the data from JSON to BSON and back when querying the database.
- a good data model for your application
    - make easier to manage data
    - make queries more efficient
    - use less memory and cpu
    - reduce costs
- in general: structure your data to match the ways that your application queries and updates it
- the key principle: model your data how your application will use the data (opposite how is done in a relational
  database)
- relationship types:
    - `one-to-one` - we can have it in a single document
    - `one-to-many`
        - embedding into a single document as an array, check how long is the array
        - or referencing (an array field with ObjectIds)
    - `many-to-many`
- way to model relationships:
    - embedding
        - avoids joins
        - provides better performance for read operations
        - allows developers to update related data in a single write operation
        - warning: overtime can create large documents, which need to be read into memory in full
        - warning: you might create unbounded documents and can exceed the max BSON size of 16MB.
    - referencing
        - no duplication of data
        - smaller documents
        - you need to query (join) multiple documents which impacts read performance
- scaling a data model
    - we want to avoid documents that are unbounded (grow over time) - can be a side effect using embedding
    - ex: blog post embedding all the comments
- schema anti-patterns
    - massive arrays
    - massive number of collections
    - bloated documents
    - unnecessary indexes
    - queries without indexes
    - data that is accessed together but stored in different collections
- schema anti-patterns to detect in Atlas:
    - Schema Anti-patterns tab and
    - Performance Advisor (M10 tier or hier) - recommendations for:
        - create indexes
        - drop indexes
        - improve schemas

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

### Upgrades and Maintenance

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
      - The feature compatibility version enables or disables the features that persist data and are incompatible with earlier versions of MongoDB.
    - Confirm the state of each member
      - Ensure that no replica set member is in the ROLLBACK or RECOVERING state. If it’s not clear what the state of the member is, the risk of corrupting or losing data rises significantly.
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
      - Connect to your replica set with MongoDB shell and issue: `db.adminCommand( { setFeatureCompatibilityVersion: "8.0" } )`
