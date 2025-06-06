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


