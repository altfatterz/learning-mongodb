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


### Clustered indexes

### Time series collections

### How to monitor indexes
