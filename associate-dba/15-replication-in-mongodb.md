## 15 - Replication in MongoDB

### Introduction to Replication - https://www.mongodb.com/docs/manual/replication/

- replication is the process of storing multiple copies of the same data on different servers
- this provides: fault tolerance and high availability
- high availability: making sure your data is continuously accessible



### Replication in MongoDB - https://www.mongodb.com/docs/manual/replication/#replication-in-mongodb

- Replica Set Primary - https://www.mongodb.com/docs/manual/core/replica-set-primary/
- Replica Set Secondary Members - https://www.mongodb.com/docs/manual/core/replica-set-secondary/
- `replica set` / replica set member (3, 5, 7 mongod instances recommended)
- replica set contains one `primary node` and multiple `secondary nodes`
- we can have a `maximum of 50 members` with a `maximum of 7 voting members`
- primary is the only one which receives write operations, ends up in primary's `oplog` which is replicated to secondaries
- secondaries replicate the primary's `oplog` and apply the operations to their data sets asynchronously.
- by default primary also handles read operations, can be changed that secondary nodes can also handle reads
  
  
    
- once the old primary comes available again, joins as a secondary, it catches up while it was unavailable
- `failover` is initiated automatically when the `primary node` of the replica set becomes unavailable
- important to have odd number members in a replicaset in order to make sure a primary will be elected in the event of a
  network partition

### Automatic failover and elections with MongoDB deployments

- `Automatic failover` is crucial to have a `fault tolerant` system
- an `election` happens if primary goes down and election is initiated which determines an new `primary` for the replica set
- during the `election` the `voting secondary nodes` cast votes for the secondary that is most suitable to become the new primary
- the member that receives the `majority` votes from voting members is the winner and becomes the primary
- election can be initiated by other events as well:
  - adding an new node to the replica set
  - initiating a replica set
  - performing replica set maintenance with `rs.stepDown()` or `rs.reconfig()`
  - if secondary members loose connection to primary for more than the configured timeout (`10 seconds` by default)
- each member of a replica set can initiate and vote in an election unless is configured not to
- `arbiters` are usually introduced if there is an even number of voting members. Arbiters also do not hold any data.
- by default, a three-member replica set has three voting members.
- a maximum of 7 members can have voting privileges in a replica set
- the default value for `priority` for all replica set members is 1, we can set a value `between 0 - 1000`
- if a member has `higher priority value` than the other members it has a greater chance of becoming the primary
- `priority` value set 0 is ineligible to become primary and it can't initiate an election 

### The MongoDB operation log

- is a `capped collection` (`oplog.rs`) (behaves similarly to a ring buffer)
- the oldest information is overwritten with new information once it reaches its capacity
- oplog entries are idempotent
  - any entry in the oplog can be applied once or several times with no difference in the final result

```bash
# oplog is in the local database
$ use local
# oplog.rs -- collection
db.oplog.rs.find()
# query the oplog with namespace (ns) and sort by natural descending order.
db.oplog.rs.find({"ns" : "sample_supplies.sales"}).sort({$natural: -1}).limit(5)
# there will be multiple operations listed on the document although we just issue one command in this example (one updateMany is not atomic)
# db.sales.updateMany() updated 5000 documents but it recorded 5000 individual db.sales.updateOne() oplog entries 
```

- By default, the storage for oplog it `5%` of the available disk space and upper limit of 50 GB (size can be changed)

```bash
# print primary oplog
# actual oplog size
# configured oplog size
# log length start to end
# oplog first event time
# oplog last event time
$ rs.printReplicationInfo()
# prints out each secondary oplog information
# {
#   syncedTo :
#   replLag : 
# }
$ rs.printSecondaryReplicationInfo()
```

- `replication lag` (`replLag`) can be caused:
    - network latency
    - disk throughput
    - long running operations
    - not having the proper `write concern` (ex: with unacknowledged writes, secondaries might not be able to catch up fast)
  
- a little replication lag is expected, but when is becoming excessive it can cause problems:
    - if secondary cannot catch up it can fall into `RECOVERING` state
    - in `RECOVERING` state the member is eligible to vote but `cannot accept read operations`
    - to bring the member to up-to-date it has to start an `initial sync`
    - `initial sync` is the process of copying all data, including the oplog from a replica set member
    - `initial sync` is expensive in terms of network / disk / CPU 

### Read and write concerns with MongoDB deployments

- `write concern` describe how many data-bearing members acknowledge a write before is considered complete
  - higher levels of acknowledgment produce a stronger durability guarantee
  - durability guarantee means that data that has been committed will not be lost in the event of a failover
  - by default `write concern` is set to `majority` (majority of the members is needed, for example 3 member replica set we need 2 members)
  - `write concern` <number> - means how many members in the replica set need to acknowledge the write
  - `write concern` set to 1 - means only the primary should acknowledge the write
  - `write concern` set to 0 - means that members are not required to acknowledge the write

```bash
$ db.cats.insertOne({ name: "Mac", color: "black", age: 6 }, { writeConcern:{ w: "majority" , wtimeout: 3000 } });
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
    - allow your application to specify the durability guarantee for the documents returned by the read operation
    - choose between returning the `most recent data` or `returning data committed` to the majority of the members
    - possible values:
        - `local` - default - (returns most recent data)
        - `available` (same as the local read concern for replica sets)
        - `majority` (returns only data that has been acknowledged as written to a majority of members in a replica set)
        - `linearizable` (reflects all successful, majority acknowledged writes that completed `before the start` of the
          read operation)

          
```bash
# Change default read and write concern for all users:
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
  - if you read from secondary, you might read `stale data`

```bash
# Ex: we’re reading from the secondary and we set the time limit for how stale our data can be:
$ mongodb://db0.example.com,db1.example.com,db2.example.com/?replicaSet=myRepl&readPreference=secondary&maxStalenessSeconds=120
```

### Deploying a replica set in a MongoDB deployment - TODO

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
