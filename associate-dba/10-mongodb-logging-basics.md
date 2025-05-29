## 10 - MongoDB Logging Basics

### MongoDB Logs in Atlas

- Downloading logs requires the following role or greater in MongoDB Atlas
  - `Project Data Access Read Only` (`GROUP_DATA_ACCESS_READ_ONLY`)

```bash
atlas auth login
# determine if your Atlas user has this role,
atlas project users list -o json

# download logs command
atlas logs download <hostname> <mongodb.gz|mongos.gz|mongosqld.gz|mongodb-audit-log.gz|mongos-audit-log.gz> [flags]

# download the mongod log file for the past 30 days from the primary node of your Atlas cluster,
atlas logs download uml3-shard-00-00.xwgj1.mongodb.net mongodb.gz
# download of mongodb.log.gz completed
gunzip mongodb.log.gz
```

### MongoDB Logs in Self Managed Instances

https://www.mongodb.com/docs/manual/reference/program/mongod/#std-option-mongod.--logpath

```bash
# On Linux by default the MongoDB log file is found in the following directory:
/var/log/mongodb/mongod.log

# if the log file is not in its default location, check the mongod.conf file to determine if an alternate path was provided.
sudo cat /etc/mongod.conf

# show recent global log messages from the RAM cache in mongosh, default is 'global'
 show log <type>
# To view the available filters that can be provided to the show log helper
show logs
[ 'global', 'startupWarnings' ]

# The mongosh helper show log global internally calls the getLog command to return recent log messages from the RAM cache:
db.adminCommand( { getLog:'global'} )
```

### MongoDB Log events

https://www.mongodb.com/docs/manual/reference/log-messages/

- Logs are stored in the `mongodb.log` file as stractured JSON, varying length depending on the type of the event

Log events:
- Connections
- Commands
- Queries
- Storage
- Replication

```bash
# mongodb log message pretty printed
{
  "t": {
    "$date": "2020-05-01T15:16:17.180+00:00"
  },
  "s": "I",
  "c": "NETWORK",
  "id": 12345,
  "ctx": "listener",
  "svc": "R",
  "msg": "Listening on",
  "attr": {
    "address": "127.0.0.1"
  }
}
```

Examples of log messages:
- OS-level warning ("c":"CONTROL")
- authorization attempt ("c":"ACCESS")
- replica set election ("c":"REPL")
  - is the process of selecting a new primary node 

### MongoDB Server log customizations



### MongoDB Server log rotation and retention

