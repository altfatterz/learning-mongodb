
### MongoDB Atlas CLI

```bash
brew install mongodb-atlas-cli
atlascli version: 1.42.2
git version:
Go version: go1.24.2
   os: darwin
   arch: arm64
   compiler: gc

Setup Atlas:

```bash
atlas setup
```

```bash
atlas organization list
atlas projects list
  
atlas clusters list

ID                         NAME           MDB VER   STATE
6632717936bcd03edc728dc0   demo-cluster   8.0.9     IDLE
```


### Mongosh

```bash
brew install mongos
mongosh --version
2.5.1
mongosh "mongodb+srv://demo-cluster.odqjme8.mongodb.net/" --apiVersion 1 --username altfatterz
```

### MongoDB Compass (UI)

```bash
brew install mongodb-compass
```

```bash
show dbs;

blog                 40.00 KiB
demo                120.00 KiB
sample_airbnb        52.44 MiB
sample_analytics      9.54 MiB
sample_geospatial     1.27 MiB
sample_guides        40.00 KiB
sample_mflix        110.88 MiB
sample_restaurants    6.53 MiB
sample_supplies       1.04 MiB
sample_training      48.29 MiB
sample_weatherdata    2.59 MiB
admin               344.00 KiB
local                17.70 GiB


use sample_restaurants;
show collections;
db.restaurants.findOne();


{
  _id: ObjectId('5eb3d668b31de5d588f4298f'),
  address: {
    building: '15',
    coord: [ -73.98126069999999, 40.7547107 ],
    street: 'West   43 Street',
    zipcode: '10036'
  },
  borough: 'Manhattan',
  cuisine: 'American',
  grades: [
    { date: ISODate('2015-01-15T00:00:00.000Z'), grade: 'A', score: 7 },
    { date: ISODate('2014-07-07T00:00:00.000Z'), grade: 'A', score: 9 },
    {
      date: ISODate('2014-01-14T00:00:00.000Z'),
      grade: 'A',
      score: 13
    },
    {
      date: ISODate('2013-07-19T00:00:00.000Z'),
      grade: 'C',
      score: 29
    },
    {
      date: ISODate('2013-02-05T00:00:00.000Z'),
      grade: 'A',
      score: 12
    }
  ],
  name: 'The Princeton Club',
  restaurant_id: '40365361'
}
```

### Local Atlas Deployment

`atlas deployments `- to create a local Atlas deployment (will deploy a `single-node replica set` on your local computer)
You can then manage your deployment, and use `Atlas Search` and `Atlas Vector Search`.

```bash
brew install mongodb-atlas-cli

atlas version
atlascli version: 1.42.2
git version:
Go version: go1.24.2
   os: darwin
   arch: arm64
   compiler: gc
```

Atlas setup:

```bash
$ atlas setup
$ atlas deployments list
NAME           TYPE    MDB VER   STATE
demo-cluster   ATLAS   8.0.9     IDLE

# creates a local container with image mongodb/mongodb-atlas-local:8.0
$ atlas deployments setup

$ atlas deployments list
NAME           TYPE    MDB VER   STATE
demo-cluster   ATLAS   8.0.9     IDLE
local9967      LOCAL   8.0.9     IDLE

$ atlas deployments connect

$ atlas deployments logs
```

Connect to the single node replicas set:

```bash
atlas deployments connect

? Select a deployment local9967 (Local)
? How would you like to connect to local9967? connectionString
mongodb://localhost:64327/?directConnection=true

$ atlas deployments connect

# Use rs.conf() to display the replica set configuration object:
AtlasLocalDev local9967 [direct: primary] test> rs.conf()

{
  _id: 'local9967',
  version: 1,
  term: 3,
  members: [
    {
      _id: 0,
      host: 'local9967:27017',
      arbiterOnly: false,
      buildIndexes: true,
      hidden: false,
      priority: 1,
      tags: {},
      secondaryDelaySecs: Long('0'),
      votes: 1
    }
  ],
  protocolVersion: Long('1'),
  writeConcernMajorityJournalDefault: true,
  settings: {
    chainingAllowed: true,
    heartbeatIntervalMillis: 2000,
    heartbeatTimeoutSecs: 10,
    electionTimeoutMillis: 10000,
    catchUpTimeoutMillis: -1,
    catchUpTakeoverDelayMillis: 30000,
    getLastErrorModes: {},
    getLastErrorDefaults: { w: 1, wtimeout: 0 },
    replicaSetId: ObjectId('682874eb924664df6331902e')
  }
}

# Use rs.status() to identify the primary in the replica set.

AtlasLocalDev local9967 [direct: primary] test> rs.status()

{
  set: 'local9967',
  date: ISODate('2025-05-17T11:57:44.257Z'),
  myState: 1,
  term: Long('3'),
  syncSourceHost: '',
  syncSourceId: -1,
  heartbeatIntervalMillis: Long('2000'),
  majorityVoteCount: 1,
  writeMajorityCount: 1,
  votingMembersCount: 1,
  writableVotingMembersCount: 1,
  optimes: {
    lastCommittedOpTime: { ts: Timestamp({ t: 1747483062, i: 1 }), t: Long('3') },
    lastCommittedWallTime: ISODate('2025-05-17T11:57:42.427Z'),
    readConcernMajorityOpTime: { ts: Timestamp({ t: 1747483062, i: 1 }), t: Long('3') },
    appliedOpTime: { ts: Timestamp({ t: 1747483062, i: 1 }), t: Long('3') },
    durableOpTime: { ts: Timestamp({ t: 1747483062, i: 1 }), t: Long('3') },
    writtenOpTime: { ts: Timestamp({ t: 1747483062, i: 1 }), t: Long('3') },
    lastAppliedWallTime: ISODate('2025-05-17T11:57:42.427Z'),
    lastDurableWallTime: ISODate('2025-05-17T11:57:42.427Z'),
    lastWrittenWallTime: ISODate('2025-05-17T11:57:42.427Z')
  },
  lastStableRecoveryTimestamp: Timestamp({ t: 1747483012, i: 1 }),
  electionCandidateMetrics: {
    lastElectionReason: 'electionTimeout',
    lastElectionDate: ISODate('2025-05-17T11:37:17.614Z'),
    electionTerm: Long('3'),
    lastCommittedOpTimeAtElection: { ts: Timestamp({ t: 0, i: 0 }), t: Long('-1') },
    lastSeenWrittenOpTimeAtElection: { ts: Timestamp({ t: 1747481837, i: 4 }), t: Long('2') },
    lastSeenOpTimeAtElection: { ts: Timestamp({ t: 1747481837, i: 4 }), t: Long('2') },
    numVotesNeeded: 1,
    priorityAtElection: 1,
    electionTimeoutMillis: Long('10000'),
    newTermStartDate: ISODate('2025-05-17T11:37:17.615Z'),
    wMajorityWriteAvailabilityDate: ISODate('2025-05-17T11:37:17.716Z')
  },
  members: [
    {
      _id: 0,
      name: 'local9967:27017',
      health: 1,
      state: 1,
      stateStr: 'PRIMARY',
      uptime: 1227,
      optime: { ts: Timestamp({ t: 1747483062, i: 1 }), t: Long('3') },
      optimeDate: ISODate('2025-05-17T11:57:42.000Z'),
      optimeWritten: { ts: Timestamp({ t: 1747483062, i: 1 }), t: Long('3') },
      optimeWrittenDate: ISODate('2025-05-17T11:57:42.000Z'),
      lastAppliedWallTime: ISODate('2025-05-17T11:57:42.427Z'),
      lastDurableWallTime: ISODate('2025-05-17T11:57:42.427Z'),
      lastWrittenWallTime: ISODate('2025-05-17T11:57:42.427Z'),
      syncSourceHost: '',
      syncSourceId: -1,
      infoMessage: '',
      electionTime: Timestamp({ t: 1747481837, i: 5 }),
      electionDate: ISODate('2025-05-17T11:37:17.000Z'),
      configVersion: 1,
      configTerm: 3,
      self: true,
      lastHeartbeatMessage: ''
    }
  ],
  ok: 1,
  '$clusterTime': {
    clusterTime: Timestamp({ t: 1747483062, i: 1 }),
    signature: {
      hash: Binary.createFromBase64('AAAAAAAAAAAAAAAAAAAAAAAAAAA=', 0),
      keyId: Long('0')
    }
  },
  operationTime: Timestamp({ t: 1747483062, i: 1 })
}

```


#### List / Pause / Start / Delete a deployment

```bash
$ atlas deployments list
$ atlas deployments pause
$ atlas deployments start
$ atlas deployments delete
```

### MongoDB Command Line Database Tools

https://www.mongodb.com/try/download/database-tools

```bash
bsondump
mongodump
mongoexport
mongofiles
mongoimport
mongorestore
mongostat
mongotop
```

```bash
# Download the sample data:
curl  https://atlas-education.s3.amazonaws.com/sampledata.archive -o sampledata.archive

# load the sample data
mongorestore --archive=sampledata.archive --port={port-number}
```

```bash
atlas deployments connect local9967

AtlasLocalDev local9967 [direct: primary] test> show dbs

admin               256.00 KiB
config              232.00 KiB
local               190.63 MiB
sample_airbnb        52.39 MiB
sample_analytics      8.71 MiB
sample_geospatial     1.12 MiB
sample_guides        16.00 KiB
sample_mflix        110.27 MiB
sample_restaurants    6.30 MiB
sample_supplies       1.00 MiB
sample_training      29.46 MiB
sample_weatherdata    2.53 MiB

```