## 8 - MongoDB Indexes

### Using MongoDB indexes in collections

`Indexes`  
- -> https://www.mongodb.com/docs/manual/indexes/
- -> https://www.mongodb.com/docs/manual/reference/indexes/

- Data structures for fast data retrieval
- support `equality matches` and `range-based` query operations and return `sorted` results
- come with a `write-performance cost`
- common types are `single field` and `compound indexes`
- multikey indexes operate on an array field

Example:

```bash
# both queries can be supported by the **(active, accounts)** `multikey compound` index
db.customers.find({ active: true })
# accounts field is an array
db.customers.find({ active: true, accounts: 276528})
```

### Creating a single field index in MongoDB

```bash
# create a single field index for birthdate field ascending order
# ascending indexes can used for both ascending and descending sorts, but will be important on compound indexes to avoid in memory sorts 
db.customers.createIndex({ birthdate: 1})

# Create a unique single field index
# Once the unique index is created, any inserts or updates including duplicated values in the collection 
# for the index field/s will fail.
db.customers.createIndex({ email: 1}, { unique:true})

# View the Indexes used in a Collection
db.customers.getIndexes()
```

explain() 
- This plan provides the details of the execution stages (`IXSCAN` , `COLLSCAN`, `FETCH`, `SORT`, etc.).

- `IXSCAN` stage indicates the query is using an index and what index is being selected.
- `COLLSCAN` stage indicates a collection scan is perform, not using any indexes.
- `FETCH` stage indicates documents are being read from the collection.
- `SORT` stage indicates documents are being sorted in memory.

```bash
# Check if an index is being used on a query
db.customers.explain().find({ birthdate: { $gt:ISODate("1995-08-01") } })
db.customers.explain().find({ birthdate: { $gt:ISODate("1995-08-01") } }).sort({ email:1 })
```

### Creating a multikey index in MongoDB

- If a single field or compound index includes an array field, then the index is a `multikey` index.
- If an index has multiple fields only one of them can be an array.
- Internally, MongoDB decomposes the array and stores each unique value found within it as an individual index entry 

These two commands will create `multikey` indexes:

```bash
# accounts field is an array
db.customers.createIndex({ accounts: 1})
db.customers.createIndex({ email: 1, accounts: 1})
```

### Working with compound indexes in MongoDB

`Compound indexes` -> https://www.mongodb.com/docs/manual/core/indexes/index-types/index-compound/
`Indexing strategies` -> https://www.mongodb.com/docs/manual/applications/indexes/

- indexes on multiple fields
- can be `multikey` index if it includes an array field
- maximum of one array field per index
- support queries that match on the `prefix of the index fields`

```bash
db.customers.createIndex({active:1, birthdate:-1,name:1})

# Queries using the index:
db.customers.find({active:true}).sort({birthDate:-1})
db.customers.find({birthdate: {$gte:ISODate("1977-01-01")},{active: true}})

# Queries cannot use the index:
db.customers.find({birthdate: {$gte:ISODate("1977-01-01")}
db.customers.find({}).sort({birthdate:1})
```

- indexes are ordered structures, the order of the fields in a compound index matters
- follow this order: `Equality, Sort, Range`
  - `Equality` - reduces query time processing and retrieves fewer documents
  - `Sort` - determine the order of the results, once we select the specific value the order field values will be in order
- the sort order of the field values in the index matters if query results are sorted by more than 1 field and they mix sort orders - to avoid in-memory sorts 

Cover a query by the Index
- An Index covers a query when MongoDB does not need to fetch the data from memory since all the required data is already returned by the index. 
- In most cases, we can use projections to return only the required fields and cover the query. Make sure those fields in the projection are in the index.

`IXSCAN` - Index scan using the compound index
`PROJECTION_COVERED` - All the information needed is returned by the index, no need to fetch from memory

### Deleting MongoDB indexes

- `dropIndex()` -> https://www.mongodb.com/docs/manual/reference/method/db.collection.dropIndex/
- `dropIndexes()` -> https://www.mongodb.com/docs/manual/reference/method/db.collection.dropIndexes/
- `hideIndex()` -> https://www.mongodb.com/docs/manual/reference/method/db.collection.hideIndex/
- `unhideIndex()` -> https://www.mongodb.com/docs/manual/reference/method/db.collection.unhideIndex/

- Deleting indexes which are not needed since it causes write performance issues
- Before deleting `hide the index`, to avoid recreating accidentally removed indices because it takes time and resources
- Hidden indexes are not used in the query but continued to be updated, you can assess the performance of queries and
  unhide the index if needed
- Unhiding the index is much faster than recreating it.

```bash
db.restaurants.hideIndex( { borough: 1, ratings: 1 } ); // Specify the index key specification document
db.restaurants.hideIndex( "borough_1_ratings_1" );  // Specify the index name
db.restaurants.unhideIndex( { borough: 1, city: 1 } );  // Specify the index key specification document
db.restaurants.unhideIndex( "borough_1_ratings_1" );    // Specify the index name
```

- Use compound indices, below the `username_1` is redundant

```bash
find({username:'Joe'})
find({username:'Joe', active:true})

indices:
username_1
username_1_active_1
```

- Drop index by key or name

```bash
db.customers.dropIndex({active:1, birthdate:-1, name:1}}
db.customers.dropIndex(active_1_birthdate_-1_name_1)
# delete all the indexes from a collection, with the exception of the default index on _id.
db.customers.dropIndexes() 
# drop specific indexes
db.customers.dropIndexes['index1name', 'index2name', 'index3name'] 
```

- Delete an index in Atlas UI with `Drop Index` option  
