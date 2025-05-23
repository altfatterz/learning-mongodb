## 5 - MongoDB CRUD Operations: Insert and Find Documents

### Inserting documents

#### `insertOne` method https://www.mongodb.com/docs/manual/reference/method/db.collection.insertOne/

```bash
# if collection is not existing it will be created automatically
db.<collection>.insertOne(<document>)

rs0 [direct: primary] test> db.test.insertOne({"name":"foo"})
{
  acknowledged: true,
  insertedId: ObjectId('68306e1bff565a5502ba7119')
}
# mongodb will generate _id field if not provided

# this also worked -> insertOne with an array, mongodb creates a document from that array
rs0 [direct: primary] test> db.test.insertOne([{"name":"foo1"}, {"name":"foo2"}] )
{
  acknowledged: true,
  insertedId: ObjectId('68306e46ff565a5502ba711a')
}
rs0 [direct: primary] test> db.test.findOne({_id: ObjectId('68306e46ff565a5502ba711a')})
{
  '0': { name: 'foo1' },
  '1': { name: 'foo2' },
  _id: ObjectId('68306e46ff565a5502ba711a')
}
```

#### `insertMany` method https://www.mongodb.com/docs/manual/reference/method/db.collection.insertMany/

```bash
db.<collection>.insertOne([<document>, <document>,...])

rs0 [direct: primary] test> db.test.insertMany([{"name":"foo1"}, {"name":"foo2"}] )
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId('68306e51ff565a5502ba711b'),
    '1': ObjectId('68306e51ff565a5502ba711c')
  }
}
```

### Finding documents

#### `find` method https://www.mongodb.com/docs/manual/reference/method/db.collection.find/

```bash
# it to iterate
db.<collection>.find()
db.<collection>.find({field: { $eq: value}}) or db.zips.find({field: value}) 
db.zips.find({state: "AZ"})

# in -> https://www.mongodb.com/docs/manual/reference/operator/query/in/
db.<collection>.find({field: { $in: [field1, field2 ...] }) 
# PHOENIX or CHICAGO
db.zips.find({ city: { $in: ["PHOENIX", "CHICAGO"] } })

# comparison operators: $gt, $lt, $lte, $gte https://www.mongodb.com/docs/manual/reference/operator/query-comparison/
db.sales.find({ "items.price": { $gt: 50}})
db.sales.find({ "customer.age": { $gte: 65}})

# matches all documents which have a "products" field with InvestmentStock 
# or an array with element "InvestmentStock"
db.sales.find({ "products": "InvestmentStock"} )
# elemMatch --> https://www.mongodb.com/docs/manual/reference/operator/query/elemMatch/ 
# get only the docs with "products" array field containing InvestmentStock 
db.sales.find({ "products": {$elemMatch: { $eg: "InvestmentStock"}}} )
# elemMatch with multiple query criteria
db.sales.find({ "products": {$elemMatch: { query, query, ... }} )
db.sales.find({ items: {$elemMatch : { name: "laptop", price: { $gt: 1}, quantity : { $gte: 1} }}})

# logical operators $and, $or, $nor, $not -> https://www.mongodb.com/docs/manual/reference/operator/query-logical/
db.<collection>.find({$and: [{expression}, {expression}, ...]})
db.<collection>.find({<expression>, <expression> ...}) # simplified
db.routes.find({$and: [{"airline":"Southwest Airline"}, {"stops": { $gte: 1}}]})
db.routes.find({"airline":"Southwest Airline", "stops": { $gte: 1}})

db.<collection>.find({$or: [{expression}, {expression}, ...]})
db.routes.find({$or: [{dst_airport:"SEA"}, {src_airport:"SEA"}]})

# mixing $and and $or
$ db.routes.find({
  $and: [
    { $or: [{ dst_airport: "SEA" }, { src_airport: "SEA" }] },
    { $or: [{ "airline.name": "American Airlines" }, { airplane: 320 }] },
  ]
})
# Note, using the implicit $and does not work here, the first $or was overwritten by the subsequent $or operation
$ db.routes.find({
    { $or: [{ dst_airport: "SEA" }, { src_airport: "SEA" }] },
    { $or: [{ "airline.name": "American Airlines" }, { airplane: 320 }] },
})
```

