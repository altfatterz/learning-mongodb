
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

### Insert 

- db.<collection-name>.insertOne
- db.<collection-name>.insert

If the collection does not exists it will be auto-created. 

```bash
db.grades.insertOne({
  student_id: 654321,
  products: [
    {
      type: "exam",
      score: 90,
    },
    {
      type: "homework",
      score: 59,
    },
    {
      type: "quiz",
      score: 75,
    },
    {
      type: "homework",
      score: 88,
    },
  ],
  class_id: 550,
})
```

```bash
db.grades.insertMany([
  {
    student_id: 546789,
    products: [
      {
        type: "quiz",
        score: 50,
      },
      {
        type: "homework",
        score: 70,
      },
      {
        type: "quiz",
        score: 66,
      },
      {
        type: "exam",
        score: 70,
      },
    ],
    class_id: 551,
  },
  {
    student_id: 777777,
    products: [
      {
        type: "exam",
        score: 83,
      },
      {
        type: "quiz",
        score: 59,
      },
      {
        type: "quiz",
        score: 72,
      },
      {
        type: "quiz",
        score: 67,
      },
    ],
    class_id: 551,
  }
])
```

### find

- $eg 
- $in 

```bash
$ db.grades.find( {'student_id': { $eq: 654321 } } )
$ db.grades.find( {'student_id': 654321 } )
$ db.grades.find( {'class_id': { $in: [ 550, 551] } } )
```