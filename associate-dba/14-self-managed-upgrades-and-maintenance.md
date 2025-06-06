## 14 - Self-Managed Upgrades & Maintenance

### Zero downtime maintenance with a MongoDB Deployment

- MongoDB minimizes downtime by leveraging `replica sets` to perform rolling maintenance
- A `replica set` remains operational even if a node is unavailable
- Requiring maintenance:
    - Upgrading to a new version of MongoDB
    - Upgrading drivers
    - Security updates to the operating system
    - Changes to replica set membership
    - Upgrading operating system
- A replica set with two secondaries, first upgrade the secondaries one be one and later the primary (there will be new primary election)
- Atlas simplifies the process of rolling maintenance by automating it for us

### MongoDB client driver upgrades

- Upgrading drivers
  - Java Sync driver check compatibility:
    - https://www.mongodb.com/docs/drivers/java/sync/current/compatibility/
  - Java Reactive Streams Driver:
    - https://www.mongodb.com/docs/languages/java/reactive-streams-driver/current/
- Occasionally, early driver upgrades can cause a regression in performance. 
- After upgrading, it’s important to thoroughly test your application before pushing it to a production environment. 
- `serverApi` field enables the `Stable API` feature https://www.mongodb.com/docs/php-library/current/connect/stable-api/
  -  allows upgrading your MongoDB server at will while ensuring that behaviour changes between MongoDB versions will not break your application

```bash
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
```

### MongoDB server upgrades

- Upgrade MongoDB version
    - upgrades that cross major releases must be done incrementally
    - In MongoDB replica sets, each node is upgraded one at a time.
    - You only have to gracefully shut down each node, which doesn’t require removing it from the replica set.
    - MongoDB upgrade does not require scheduled downtime.
- Upgrade MongoDB pre-upgrade checklist:  (for example: upgrade from 7.0.x to 8.0.x)
    - Check version of MongoDB database: `db.version()`. Recommended to have the latest patch installed here.
    - Confirm the Feature Compatibility Version of each member of the replica set
        - `db.adminCommand( { getParameter: 1, featureCompatibilityVersion: 1 } ).featureCompatibilityVersion`
        - The feature compatibility version enables or disables the features that persist data and are incompatible with
          earlier versions of MongoDB.
    - Confirm the replica set member state is healthy
        - Ensure that no replica set member is in the `ROLLBACK` or `RECOVERING` state. (use `rs.status()` command)
        - If it’s not clear what the state of the member is, the risk of corrupting or losing data rises significantly.
    - Determine the oplog window
        - `db.printReplicationInfo()` (`log length start to end`)
        - oplog entries are time-stamped
        - The oplog window is the time difference between the newest and the oldest timestamps in the oplog.
        - If a secondary node loses connection with the primary, it can only use replication to sync up again if the
          connection is restored within the oplog window.
        - If the connection is restored outside the oplog window, the secondary might need to perform a full sync, 
          which can be resource-intensive.
        - Changes in workload can rapidly change the oplog window -> maintenance should be done not on peek hours
        - Gives up rough estimate how much time we have to perform maintenance on a single node
    - Confirm Secondaries’ Replication Lag (`replLag` field)
        - `rs.printSecondaryReplicationInfo()`
    
- Upgrade process:
    - Gracefully shut down and upgrade secondaries one by one
    - Elect a New Primary
        - Confirm you are logged to a primary: `print({CurrentNode: rs.hello().me, Primary: rs.hello().primary})`
        - Call for an election to change the primary: `rs.stepDown()`
    - Upgrade Primary
    - Test applications with the new version and if you find no error continue
    - Set the Feature Compatibility Version
        - Connect to your replica set with MongoDB shell and
          issue: `db.adminCommand( { setFeatureCompatibilityVersion: "8.0" } )`

