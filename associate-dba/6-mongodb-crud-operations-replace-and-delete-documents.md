## 6 - MongoDB CRUD Operations: Replace and Delete Documents

### Replacing a document - https://www.mongodb.com/docs/manual/reference/method/db.collection.replaceOne/

```bash
# use the filter on the _id field, to ensure you update a single document
db.collection.replaceOne(
   <filter>, # specify {} empty document to replace the first document returned in the collection
   <replacement>,
   # the below opitions are not required
   {
      upsert: <boolean>, # if true replaces the document, or if not found then inserts it
      writeConcern: <document>, # https://www.mongodb.com/docs/manual/reference/write-concern/ 
      collation: <document>, # allows users to specify language-specific rules for string comparison
      hint: <document|string>, # document or string that specifies the index to use to support the filter.
      sort: <document> 
   }
)
 
```

Example:

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
  acknowledged: true, #  true if the operation ran with 'write concern' false if `write concern` was disabled 
  insertedId: null,
  matchedCount: 1, # how many docs matches our filter
  modifiedCount: 1, # how many docs were modified
  upsertedCount: 0
}
```


### Updating MongoDB documents by using updateOne()

```bash
// options document is not required, <document> here can contain operators like `$set` or `$push`
$ db.<collection>.updateOne(<filter>, <document>, <options>)  // options are not required
```

`$set` -> https://www.mongodb.com/docs/manual/reference/operator/update/set/
- replaces the value of a field with the specified value or adds the field if not existing

Example:

```bash
db.podcasts.updateOne(
  { _id: ObjectId("5e8f8f8f8f8f8f8f8f8f8f8") },
  { $set: { subscribers: 98562} }
)
```

- `$push` -> https://www.mongodb.com/docs/manual/reference/operator/update/push/
- adds a new value to the hosts array field or creates the array field if does not exist
- Note that using this operator is not idempotent !

```bash
db.podcasts.updateOne(
  { _id: ObjectId("5e8f8f8f8f8f8f8f8f8f8f8") },
  { $push: { hosts: "Nic Raboy" } }
)
```

- `upsert` option - https://www.mongodb.com/docs/drivers/node/current/crud/update/ 
- option creates a new document if no documents match the filtered criteria

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

### Updating MongoDB documents by using findAndModify() - deprecated

`findAndModify`
- https://www.mongodb.com/docs/manual/reference/method/db.collection.findAndModify/
- `findAndModify` is deprecated use `findOneAndModify`, `findOneAndDelete`, or `findOneAndReplace`
- guarantees that the exact document you just updated will be returned
- we could use `updateOne() + findOne()` but that is 2 round trips with possibility that in between was another
    modification meanwhile

```bash
db.podcasts.findAndModify({
  query: { _id: ObjectId("6261a92dfee1ff300dc80bf1") },
  update: { $inc: { subscribers: 1 } },
  new: true, # the modified document is returned, default is false
})
```

Example with `upsert`:

```bash
db.zips.findAndModify({
  query: { zip: 87571 },
  update: { $set: { city: "TAOS", state: "NM", pop: 40000 } },
  upsert: true,
  new: true,
})
```

### Updating MongoDB documents by using updateMany()

https://www.mongodb.com/docs/manual/reference/method/db.collection.updateMany/

```bash
db.<collection>.updateMany(<filter>, <update>, <option>) 
```
- note that this operation is `not all-or-nothing` (if the operation fails, the operation does not roll back updates)
- in this case some documents might be updated, you can run the updateMany operation again (if the update is idempotent)
- `lacks isolation`, updates are visible as soon as they are performed, so it might be not suitable for some use case

An example:

```bash
db.books.updateMany(
  { publishedDate: { $lt: new ISODate("2019-01-01T08:00:00.000Z") } },
  { $set: { status: "LEGACY" } }
)
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 351,
  modifiedCount: 351,
  upsertedCount: 0
}
```

### Deleting MongoDB documents

`deleteOne()` --> https://www.mongodb.com/docs/manual/reference/method/db.collection.deleteOne/
- Note that if the filter is not returning only one document, it will just delete only one of the ones matching the filter

```bash
db.podcasts.deleteOne({ _id: ObjectId("6282c9862acb966e76bbf20a") })
{ acknowledged: true, deletedCount: 1 }
```

`deleteMany()` -> https://www.mongodb.com/docs/manual/reference/method/db.collection.deleteMany/

```bash
db.podcasts.deleteMany({category: “crime”})
{ acknowledged: true, deletedCount: 3 }
```

