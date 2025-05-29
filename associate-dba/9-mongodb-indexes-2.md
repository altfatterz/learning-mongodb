## 9 - MongoDB Indexes II

### How indexes work

- MongoDB stores indexes in easily accessible blocks of data in B-tree data structure
- B-tree is not binary tree, nodes can have more than 2 child nodes
- B-tree sort their stored data in ascending sequential order from left to right
- MongoDB traverses a B-tree to retrieve data by using an index

### Index usage details via explain

```bash
# queryPlanner mode is the default
db.collection.explain("queryPlanner").find({ timestamp: { $gt: 2 }, isActivated: true })
db.collection.explain().find({ timestamp: { $gt: 2 }, isActivated: true })

# To get specific information from the explain output, you can use vanilla JavaScript dot notation.
db.collection.find({timestamp: {$gt: 2}, isActivated: true}).explain().queryPlanner.winningPlan
db.collection.find({timestamp: { $gt: 2 }, isActivated: true}).explain().queryPlanner.rejectedPlans

# executionStats mode to get detailed execution stats: 
# nReturned, 
# totalKeysExamined
# totalDocsExamined
# executionTimeMillis
db.collection.explain("executionStats").find({timestamp: { $gt: 2 }, isActivated: true}).sort({ rating: -1 })

# allPlansExecution verbosity mode contains scores that MongoDB’s query planner calculates for each index based on a number of factors 
db.collection.explain("allPlansExecution").find({timestamp: { $gt: 2 }, isActivated: true});
```

### Optimized compound indexes

- To force MongoDB to use the compound index, use the `hint` method on the query itself

```bash
db.users.createIndex({ dob: 1, inactive: 1})

db.users.find({dob: { $gte: new Date("1988"), $lte: new Date("1990") },inactive: false,})
.hint({dob: 1, inactive: 1}).explain("executionStats").executionStats
```

Ideal method for creating a compound index: (`ESR` rule)
- equality fields
- sort fields (in the same order as the query)
- range filters

- ESR is not a hard rule, it is more a recommendation, better to test your queries 
 
- `totalDocsExamined` is 3 while `nReturned` is 2 which means MongoDB scanned an extra document. 
- The number of documents and index keys examined should be the same as the number of documents returned. 
- If MongoDB examines more documents than it returns, this indicates that the index used by this query could be optimized further.
```bash
{
  executionSuccess: true,
  nReturned: 2,
  executionTimeMillis: 0,
  totalKeysExamined: 3,
  totalDocsExamined: 3,
}
```

- In-memory sorts costs CPU and RAM and have a 100 MB limit.
- To get around the 100 MB limit use `.allowDiskUse()` method on the query, to allow temporary files written to disk (slower since introduces disk IO)
 
```bash
db.zips.find({
  pop: { $gte: 100000, $lte: 111000 },
  city: 'NEW YORK',
  state: 'NY',
}).sort({ zip: 1 }).explain('executionStats').executionStats

{
  executionSuccess: true,
  nReturned: 2,
  executionTimeMillis: 23,
  totalKeysExamined: 0,
  totalDocsExamined: 29470,
  executionStages: {
    isCached: false,
    stage: 'SORT',
    nReturned: 2,
    executionTimeMillisEstimate: 22,
    works: 29474,
    advanced: 2,
    needTime: 29471,
    needYield: 0,
    saveState: 1,
    restoreState: 1,
    isEOF: 1,
    sortPattern: { zip: 1 },
    memLimit: 33554432,
    type: 'simple',
    totalDataSizeSorted: 286,
    usedDisk: false,
    spills: 0,
    spilledDataStorageSize: 0,
    inputStage: {
      stage: 'COLLSCAN',
      filter: {
        '$and': [
          { city: { '$eq': 'NEW YORK' } },
          { state: { '$eq': 'NY' } },
          { pop: { '$lte': 111000 } },
          { pop: { '$gte': 100000 } }
        ]
      },
      nReturned: 2,
      executionTimeMillisEstimate: 22,
      works: 29471,
      advanced: 2,
      needTime: 29468,
      needYield: 0,
      saveState: 1,
      restoreState: 1,
      isEOF: 1,
      direction: 'forward',
      docsExamined: 29470
    }
  }
}


# created the following index
db.zips.createIndex({city:1, state:1})
city_1_state_1

db.zips.find({ pop: { $gte: 100000, $lte: 111000 }, city: 'NEW YORK', state: 'NY' }).sort({ zip: 1 }).explain('executionStats').executionStats
{
  executionSuccess: true,
  nReturned: 2,
  executionTimeMillis: 1,
  totalKeysExamined: 40,
  totalDocsExamined: 40,
  executionStages: {
    isCached: false,
    stage: 'SORT',
    nReturned: 2,
    executionTimeMillisEstimate: 0,
    works: 44,
    advanced: 2,
    needTime: 41,
    needYield: 0,
    saveState: 0,
    restoreState: 0,
    isEOF: 1,
    sortPattern: { zip: 1 },
    memLimit: 33554432,
    type: 'simple',
    totalDataSizeSorted: 286,
    usedDisk: false,
    spills: 0,
    spilledDataStorageSize: 0,
    inputStage: {
      stage: 'FETCH',
      filter: {
        '$and': [ { pop: { '$lte': 111000 } }, { pop: { '$gte': 100000 } } ]
      },
      nReturned: 2,
      executionTimeMillisEstimate: 0,
      works: 41,
      advanced: 2,
      needTime: 38,
      needYield: 0,
      saveState: 0,
      restoreState: 0,
      isEOF: 1,
      docsExamined: 40,
      alreadyHasObj: 0,
      inputStage: {
        stage: 'IXSCAN',
        nReturned: 40,
        executionTimeMillisEstimate: 0,
        works: 41,
        advanced: 40,
        needTime: 0,
        needYield: 0,
        saveState: 0,
        restoreState: 0,
        isEOF: 1,
        keyPattern: { city: 1, state: 1 },
        indexName: 'city_1_state_1',
        isMultiKey: false,
        multiKeyPaths: { city: [], state: [] },
        isUnique: false,
        isSparse: false,
        isPartial: false,
        indexVersion: 2,
        direction: 'forward',
        indexBounds: {
          city: [ '["NEW YORK", "NEW YORK"]' ],
          state: [ '["NY", "NY"]' ]
        },
        keysExamined: 40,
        seeks: 1,
        dupsTested: 0,
        dupsDropped: 0
      }
    }
  }
}
```

### Wildcard indexes - https://www.mongodb.com/docs/manual/core/indexes/index-types/index-wildcard/

- Support queries against unknown fields
- Useful for datasets with dynamic schemas, ex: IoT, lots of metadata, or weather services
- you can have multiple wildcard indexes per collection
- may cover the same fields as other indexes in the collection
- cannot use the `unique` or `TTL` options

Example data:

```bash
db.getSiblingDB("sample_products").products.insertMany([
  {
    _id: new ObjectId("64a36318574fd20cd8fb9798"),
    sku: 111,
    product_name: "Stero Speakers",
    price: 100,
    stock: 5,
    product_attributes: { color: "black", size: "5x5x5", weight: "5lbs" },
  },
  {
    _id: new ObjectId("64a36318574fd20cd8fb9799"),
    sku: 121,
    product_name: "Bread",
    price: 2,
    stock: 50,
    product_attributes: {
      type: "white",
      calories: 100,
      weight: "24g",
      crust: "soft",
    },
  },
  {
    _id: new ObjectId("64a36318574fd20cd8fb979a"),
    sku: 131,
    product_name: "Milk",
    price: 3,
    stock: 20,
    product_attributes: {
      type: "2%",
      calories: 120,
      weight: "1L",
      brand: "Dairy Farmers",
    },
  },
]);
```

We could create `product_attributes` like an array with `key` and `value` fields

```bash
{
    _id: new ObjectId("64a36318574fd20cd8fb979a"),
    sku: 131,
    product_name: "Milk",
    price: 3,
    stock: 20,
    product_attributes: [
      { k: "type", v: "2%" },
      { k: "calories", v: "120" },
      { k: "weight", v: "1L" },
      { k: "brand", v: "Dairy Farmers" }
    ]
}    

# we can create a compound index like:
db.products.createIndex({ "product_attributes.k": 1, "product_attributes.v": 1})

# querying is unnatural, you need to use `elemMatch` operator
db.products.find({"product_attributes" : $elemMatch: { k: "color", v: "black"} })

# other approach to keep the documents how it is and add a wildcard index to the `product_attributes` field
db.products.createIndex({"product_attributes.$**": 1})
# supports queries on each field inside the `product_attributes` field 
db.products.find({"product_attributes.type": "Oat"})
db.products.find({"product_attributes.crust": true})
...

# inspect the winning plan and confirm that the wildcard index is being used
db.products.find({"product_attributes.crust": false}).explain().queryPlanner.winningPlan

# create index for all fields in the document, useful for very dynamic documents, by default do not index the _id field 
# embedded documents are indexed entirely and also array fields are indexed 
db.products.find({"$**" : 1})
 
# this command indexes all fields including the _id field, and skipping the stock and prices fields
# wildcardProjection - to include or exclude certain fields in the wildcard index
db.products.createIndex({ "$**": 1 }, { wildcardProjection: { _id: 1, stock: 0, prices: 0 } })

# check the winning plan
# if there are multiple eligible indexes that produce the same score, MongoDB chooses one arbitrarily  
db.products.find({"product_attributes.crust": false}).explain().queryPlanner.winningPlan 
db.products.find({"product_attributes.crust": false}).hint("$**_1").explain().queryPlanner.winningPlan

# compound wildcard index: on the stock field and all of the product attributes fields
db.products.createIndex({stock: 1, "product_attributes.$**" : 1 })
```

### Partial indexes - https://www.mongodb.com/docs/manual/core/index-partial/

- When you have a collection of millions of documents but you only ever query a subset of them based on specific criteria
- You could index the whole thing but there is a better way -> `Partial index`
- `Partial indexes` only index documents that match a filter expression
  - -> reduced storage requirements
  - -> reduced memory footprint
- Restrictions:
  - `_id` field cannot be added to the partial index
  - shard key fields cannot be added to the partial index

```bash

#  only indexes documents with a population greater than or equal to 10000
db.zips.createIndex( { state: 1 },{ partialFilterExpression: { pop: { $gte: 10000 } } } }

# for this query the index was not used, since in CA state there are documents with population less than 10000
db.zips.find({ state: "CA" }).explain().queryPlanner.winningPlan

# here the partial index was used
db.zips.find({ state: "CA", pop: { $gte: 10000 } }).explain().queryPlanner.winningPlan

# again here the partial index was not used since there are documents in the result set that have a population of less than 10000
db.zips.find({ state: "CA", pop: { $lte: 12000 } }).explain().queryPlanner.winningPlan
```


### Sparse indexes - https://www.mongodb.com/docs/manual/core/index-sparse/

- Contain entries for documents that contain the indexed field, even if the field's value is null.
- Documents without the indexed field are not part of the index
- Index types that are sparse by default: 2D, 2DSphere, GeoHaystack, Wildcard
- `Partial` vs `Sparse` index:
  - Partial indexes are recommended when you have complex criteria for what should be indexed
  - Recommended when you are only interested whether a fields is present or not, regardless of its value
- Limitations:
  - Sparse index will not be used by MongoDB if the result will be incomplete
  - Sparse index with unique constraints - don't apply to documents that omit the indexed field

Examples:

```bash
db.getSiblingDB("sample_db").sparseExample.insertMany([
  {
    _id: new ObjectId("64920144bf3922c17f7181ca"),
    username: "coolUser",
    avatar_url: "https://api.multiavatar.com/coolUser.svg",
  },
  {
    _id: new ObjectId("64920144bf3922c17f7181cb"),
    username: "testUser",
    avatar_url: "https://api.multiavatar.com/testUser.svg",
  },
  {
    _id: new ObjectId("64920144bf3922c17f7181cc"),
    username: "anotherUser",
    avatar_url: "https://api.multiavatar.com/anotherUser.svg",
  },
  { _id: new ObjectId("64920173bf3922c17f7181cd"), username: "test" },
]);

# create a sparse index
db.sparseExample.createIndex({ avatar_url: 1 }, { sparse: true })

# check the use of index
db.sparseExample.find({ avatar_url: { $exists: true } }).explain().queryPlanner.winningPlan

{
  isCached: false,
  stage: 'FETCH',
  inputStage: {
    stage: 'IXSCAN',
    keyPattern: { avatar_url: 1 },
    indexName: 'avatar_url_1',
    isMultiKey: false,
    multiKeyPaths: { avatar_url: [] },
    isUnique: false,
    isSparse: true,
    isPartial: false,
    indexVersion: 2,
    direction: 'forward',
    indexBounds: { avatar_url: [ '[MinKey, MaxKey]' ] }
  }
}

# the sparse index wasn’t used since using it would lead to incomplete results
db.sparseExample.find().sort({ avatar_url: 1 }).explain().queryPlanner.winningPlan

{
  isCached: false,
  stage: 'SORT',
  sortPattern: { avatar_url: 1 },
  memLimit: 104857600,
  type: 'simple',
  inputStage: { stage: 'COLLSCAN', direction: 'forward' }
}
```

# sparse index with unique constraint
db.sparseExample.createIndex( {username: 1} , { sparse: 1, unique: true} )

# we can still insert documents with no username, the uniqueness will not trigger
db.sparseExample.insertOne({avatar_url: "https://api.multiavatar.com/best.svg}"})
{
    acknowledged: true,
    insertedId: ObjectId('68384782c27201e8c42cf33a')
}


### Clustered indexes and collections - https://www.mongodb.com/docs/manual/core/clustered-collections/ 

- All the index types discussed so far are stored separately from the actual documents
- CRUD operations must therefore manipulate multiple data streams depending on the number of indexes
- `Clustered indexes`
  - available as part of a clustered collection
  - can only be created when the clustered collection is built
- `Clustered collection` - collections created with a `clustered index` specification
  - Clustered indexes arrange documents according to their index key. This improves query performance on range and equality matches by reducing access to the disk.
  - store the clustered index key alongside the documents
  - non-clustered collections store documents in arbitrary order and keep index data separately
  - Benefits: 
    - improve CRUD performance
    - improve query efficiency when using the clustered index key
    - reduce disk usage
    - reduce I/O
    - improve memory usage
  - Limitations:
    - can only be created when the collection is created
    - only one clustered index per clustered collection
    - secondary indexes can be added to clustered collection
    - clustered indexes not automatically used by the query planner if an eligible secondary index exists, use hint() to force
    - can't be created in capped collections
    - can't be hidden

    
### Time series collections - https://www.mongodb.com/docs/manual/core/timeseries-collections/

- are `clustered collections` and by definition includes a clustered index
- `time series collection`
  - Documents are organized in such a way that those that originate from a single source will be grouped together with other data from a similar point in time.
  - hold time series data - any data that is changing over time
  - consists of 3 components:
    - `time` - a clustered index is automatically created on this field
    - `metadata` - the source, like sensor_id, etc 
    - `measurements` - key value pairs
  

```bash
# create a time series collection
db.createCollection("weather", {
  timeseries: {
    timeField: "timestamp", # valid BSON date type
    metaField: "metadata", # optional, but recommended, ex: device_id, sensor_id, measurement_type, etc..
    granularity: "hours", # optional, the frequency at which we want to collect data, values can be: 'seconds' (default), 'minutes', 'hours'
  },
})

# example data
{ 
  "metadata" {
    "sensor_id" : 5578,
    "type": "temperature",
  },
  "timestamp": ISODate("2025-05-12T00:00:00.000Z")
  "temp": 12
}

# check if the clustered index was used
db.weather.find({timestamp: ISODate("2025-05-12T00:00:00.000Z")}).explain().stages[0].$cursor.queryPlanner.winningPlan

{
  stage: 'CLUSTERED_IXSCAN',
  filter: {  },
  direction: 'forward',
  minRecord: ObjectId("607b76800000000000000000"),
  maxRecord: ObjectId("60a30380ffffffffffffffff")
}

# MongoDB recommends adding one or more secondary compound indexes on the fields designated as the timeField and metaField
db.weather.createIndex( { "metadata.sensorId": 1, "timestamp": 1 } )

# the secondary index could support query like:
db.weather.explain().find({ "metadata.sensorId": 5578 }).sort({ "timestamp": 1 })
```

### How to monitor indexes

```bash

# $indexStats will provide details about each of our indexes within a given collection 
db.customers.aggregate([{ $indexStats: {} }])

# based on the accesses.ops field values, you can determine which indexes are being used frequently and those that are not used at all.
[
  {
    name: '_id_',
    key: { _id: 1 },
    accesses: { ops: Long("0"), since: ISODate("2023-06-15T19:08:51.580Z") },
    host: '<cluster>.mongodb.net:27017'
  },
  ...
  {
    name: 'accounts_1',
    key: { accounts: 1 },
    accesses: { ops: Long("67"), since: ISODate("2023-06-21T20:20:25.955Z") },
    host: '<cluster>.mongodb.net:27017'
  },
  {
    name: 'email_1_username_1',
    key: { email: 1, username: 1 },
    accesses: { ops: Long("57"), since: ISODate("2023-06-21T20:20:25.997Z") },
    host: '<cluster>.mongodb.net:27017'
  },
  {
    name: 'username_1_email_1',
    key: { username: 1, email: 1 },
    accesses: { ops: Long("0"), since: ISODate("2023-06-21T20:20:26.040Z") },
    host: '<cluster>.mongodb.net:27017'
  }
]
```

```bash
# preferably enable it on non-production database
# any operation that takes longer than 30 ms is considered slow. 
db.setProfilingLevel(1, { slowms: 30 })
```

- Enabling the `database profiler` will capture database operations and record them in a capped collection called `system.profile`. 
- Depending on the profiling level (1, or 2), the profiler will record only slow operations with a setting of 1 (defined by the `slowms` threshold), or all operations with a setting of 2.