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

db.setProfilingLevel() - https://www.mongodb.com/docs/manual/reference/method/db.setprofilinglevel/

```bash
# The profiler level:
# - 0 to disable profiling completely
# - 1 for profiling operations that take longer than the threshold, 
# - 2 for profiling all operations.
# When the profiler is disabled, db.setProfilingLevel() configures which slow operations are written to the diagnostic log.
# Log everything which takes longer than 30 milliseconds
db.setProfilingLevel(0, { slowms: 30 })

# find log messages related to slow operation
sudo grep "Slow query" /var/log/mongodb/mongod.log | jq

vim /etc/mongod.conf
# Set the Verbosity Level for all components
systemLog:
  verbosity: 1

# set the verbosity level for a single component
...
systemLog:
  ...
  component:
    index:
      verbosity: 1
...  
sudo systemctl mongod restart
```

### MongoDB Server log rotation and retention

- Atlas retains the last 30 days of log messages and system event audit messages. (M10 and above)
- The Performance Advisor retains at most 7 days of logs.

```bash
# Rotating Logs in mongosh
db.adminCommand( { logRotate : 1 } )
# Rotating Log alternatively, you can issue the SIGUSR1 signal to the mongod process
sudo kill -SIGUSR1 $(pidof mongod)
```

Rotation Strategies
- `rename` (default when using `mongod -v --logpath /var/log/mongodb/server1.log`
- `reopen` (`mongod -v --logpath /var/log/mongodb/server1.log --logRotate reopen --logappend`)

Automating Log Rotation with the Linux `logrotate` Service. 
More details: https://www.mongodb.com/docs/manual/tutorial/rotate-log-files/

