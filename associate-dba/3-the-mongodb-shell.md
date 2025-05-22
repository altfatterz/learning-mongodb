## 3 - The MongoDB Shell https://github.com/mongodb-js/mongosh

### Install Mongo Shell https://www.mongodb.com/docs/mongodb-shell/install/

```bash
brew install mongosh

which mongosh
/opt/homebrew/bin/mongosh

mongosh --version
2.5.1

# https://www.mongodb.com/docs/mongodb-shell/connect/
mongosh --port 27017
Current Mongosh Log ID:	68286ac37eab055e127a5515
Connecting to:		mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.1
Using MongoDB:		8.0.9
Using Mongosh:		2.5.1

```


### Atlas cluster connection string https://www.mongodb.com/docs/atlas/connect-to-database-deployment/

```bash
mongosh "mongodb+srv://<username>:<password>@<cluster_name>.example.mongodb.net"
mongosh -u exampleuser -p examplepass "mongodb+srv://myatlasclusteredu.example.mongodb.net"
mongosh "mongodb+srv://demo-cluster.odqjme8.mongodb.net/" --apiVersion 1 --username altfatterz
```

### Mongo Shell options: https://www.mongodb.com/docs/mongodb-shell/reference/options/

### Connection locally

```bash
mongosh # using default port 27017
mongosh --port 27018
```

### Helpers

```bash
rs0 [direct: primary] test> db
rs0 [direct: primary] test> db.hello()
rs0 [direct: primary] test> use sample_training
rs0 [direct: primary] test> show collections
rs0 [direct: primary] test> show dbs
rs0 [direct: primary] test> db.transactions.insertOne({"account_id":1})
rs0 [direct: primary] test> db.transactions.findOne()
rs0 [direct: primary] test> db.transactions.deleteOne({"account_id":1})
```

### Configure

#### Config API https://www.mongodb.com/docs/mongodb-shell/reference/configure-shell-settings-api/#std-label-configure-settings-api

Settings will persist between shell session - stored on the file system (`~/.mongodb/config`) per-user 

```bash
# https://www.mongodb.com/docs/mongodb-shell/reference/configure-shell-settings/#std-label-mongosh-shell-settings
rs0 [direct: primary] test> config
Map(22) {
  'displayBatchSize' => 20,
  'maxTimeMS' => null,
  'enableTelemetry' => true,
  'editor' => null,
  'snippetIndexSourceURLs' => 'https://compass.mongodb.com/mongosh/snippets-index.bson.br',
  'snippetRegistryURL' => 'https://registry.npmjs.org',
  'snippetAutoload' => true,
  'inspectCompact' => 3,
  'inspectDepth' => 6,
  'historyLength' => 1000,
  'showStackTraces' => false,
  'redactHistory' => 'remove',
  'oidcRedirectURI' => undefined,
  'oidcTrustedEndpoints' => undefined,
  'browser' => undefined,
  'updateURL' => 'https://downloads.mongodb.com/compass/mongosh.json',
  'disableLogging' => false,
  'logLocation' => undefined,
  'logRetentionDays' => 30,
  'logMaxFileCount' => 100,
  'logCompressionEnabled' => false,
  'logRetentionGB' => undefined
}
rs0 [direct: primary] test> config.get("enableTelemetry")
rs0 [direct: primary] test> config.set("enableTelemetry", false)
rs0 [direct: primary] test> config.reset("enableTelemetry") # reset to default settings
```

#### `mongosh.conf` settings file https://www.mongodb.com/docs/mongodb-shell/reference/configure-shell-settings-global/#std-label-configure-settings-global

- Good way to set options for all users of the shell
- Can be used to change the same settings as with the `Config` object
- The changes in `mongosh.conf` are overridden with the `Config` object settings 

`MacOS`:
```bash
/usr/local/etc/mongosh.conf
/opt/homebrew/etc/mongosh.conf
/etc/mongosh.conf
````

touch /opt/homebrew/etc/mongosh.conf

```bash
mongosh:
  displayBatchSize: 50
  inspectDepth: 20
  redactHistory: "remove-redact"
```

#### Passing command line arguments to `mongosh`

```bash
mongosh --eval "disableTelemetry()" # we don't even enter the shell
mongosh --eval "db.accounts.find().limit(3)" --quiet # we don't even enter the shell
mongosh --eval "var hello = 'hello world'" --shell
```

### Interpret JavaScript

- `monogsh` built on top of NodeJS

```bash
function giveMeADate(year, month, day = 1) {
    !year || !month ? new Error("Year and month are required") : null
    month = typeof month === "number" && month < 10 ?  `0${month}` : month
    day = typeof day === "number" && day < 10 ? `0${day}` : day
    return ISODate(`${year}-${month}-${day}T00:00:00.000Z`);
}
```

Load script: https://www.mongodb.com/docs/mongodb-shell/write-scripts/

```bash
mongosh
load("giveMeADate.js")  # relative to where you issues the mongosh command
```

Set editor to vim

```bash
config.set("editor", "vim")
```

#### Mongoshrc.js - add functionality to MongoDB Shell

```bash
db.adminCommand({getParameter:1, featureCompatibilityVersion: 1})
{
  featureCompatibilityVersion: { version: '8.0' },
  ok: 1,
  '$clusterTime': {
    clusterTime: Timestamp({ t: 1747921241, i: 1 }),
    signature: {
      hash: Binary.createFromBase64('AAAAAAAAAAAAAAAAAAAAAAAAAAA=', 0),
      keyId: Long('0')
    }
  },
  operationTime: Timestamp({ t: 1747921241, i: 1 })
}
```

```bash
touch ~/.mongoshrc.js
code ~/.mongoshrc.js
const fcv = () => db.adminCommand({getParameter:1, featureCompatibilityVersion: 1})
```

#### Customize Prompt: https://www.mongodb.com/docs/mongodb-shell/reference/customize-prompt/#std-label-customize-the-mongosh-prompt

#### Tips and Tricks https://dev.to/mongodb/mongodb-shell-tips-and-tricks-1ceg

- Write query results to a JSON file

`JSON.stringify(value, replacer, space)`
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify

```bash
mongosh
const hostInfo = db.hostInfo()
# https://nodejs.org/api/fs.html#fswritefilesyncfile-data-options
fs.writeFileSync("hostInfo.json", JSON.stringify(hostInfo, null, 2))
```

- Generate seed data and store it in a MongoDB database

```bash
# install it in the same directory as the external script
# https://fakerjs.dev/guide/
cd associate-dba
npm install @faker-js/faker --save-dev 
➜  associate-dba git:(master) ✗ npm fund
associate-dba
└── https://opencollective.com/fakerjs
    └── @faker-js/faker@9.8.0
    
monogosh
# https://www.mongodb.com/docs/manual/reference/method/js-native/
rs0 [direct: primary] test> load("fakeUsers.js")
Inserting fake users ...
true
rs0 [direct: primary] test> load("fakeUsers.js")
rs0 [direct: primary] test> use test_data
rs0 [direct: primary] test_data> db.users.countDocuments()
10      
rs0 [direct: primary] test_data> db.users.findOne()
{
  _id: ObjectId('682f3071a61aee5b2cd12340'),
  name: 'Robin Boyle',
  email: 'Lottie.Kris@gmail.com',
  phone: '437.213.6112 x81034'
}
```
