## 13 - MongoDB Database Metrics & Monitoring

### Core Metrics

- What we should monitor?
    - `Query targeting`
        - measures read efficiency by analysing the ratio of documents scanned to documents returned
        - ideal ration is 1, meaning every document scanned was returned
        - very high ratio 10000 document scanned to 1 returned, negatively impacts system performance
        - helps you to determine whether you need to optimize your queries or indexes
    - `Storage`
      - help to monitor storage used by collections and indexes
      - writes are refused if storage capacity is reached and instances could crash
      - Key Metrics:
        - `Disk Queue Depth`
          - tells us the average length of the queue of requests issued to the disk partition used by MongoDB.
          - indicates whether or not operations are waiting to be serviced.
        - `Disk IOPS` - io operations per second
        - `Disk Latency` - number of milliseconds required to complete a storage operation
        - `Disk Space Percent Free`
    - `CPU utilization`
        - prolonged high CPU usage can lead to operation delays
        - optimize query performance with indexes or upgrade your cluster
    - `Memory utilization`
         - MongoDB will reserve most of the available system memory
         - MongoDB recommends the system to be sized to hold all indexes
         - Key Metrics:
           - `System Memory`
           - `Swap Usage`
    - `Replication lag`
        - measures delay between the primary and secondary (expressed in seconds)
        - high value negatively impacts `elections` and `distributed read consistency` in replica sets
- What is the `baseline value`?
    - establish by sampling metrics during steady workload
- What is an acceptable `burst value`?
    - normal to have occasional spikes
    - excessive spiking or sustained spikes could indicate an issue
- What is `out of range` value?
    - for `Query Targeting` a very high ratio
    - for `Replication lag`: a secondary is unable to keep up with the primary
    - for rest of metrics: resource exhaustion, 90% or above

### More Metrics

- `Opcounters`
    - number of operations per second run on a MongoDB process since the last restart
    - MongoDB tracks: `command`, `query`, `insert, `delete`, `update` and `getMore`
- `Network traffic`
    - `bytesIn` - displays the average rate of physical bytes (after any wire compression) sent to the database server per
      second over the selected sample period.
    - `bytesOut` - displays the average rate of physical bytes (after any wire compression) sent from the database server
      per second over the selected sample period.
    - `numRequests` - displays the average rate of requests sent to the database server per second over the selected
      sample period.
- `Connections`
    - total number of open connections, by apps, shell clients and internal MongoDB connections
    - excessive connections can affect system performance
    - M10 cluster can handle 1500 connections
- `Tickets available`
    - nr of concurrent read and write operations available to the MongoDB storage engine
    - when available tickets drop to 0, other operations must wait until one of the running operations completes and
      frees up the ticket
    - by default is 128 tickets are available

### Monitoring M10+

#### View and analyse metrics

- `Metrics Tab Panel`
    - Free/Shared Clusters metrics available:
        - `Connections`, `Network`, `Opcounters`, `Logical Size`
    - M10+ Clusters
        - More than 40 metrics
        - Time period can be adjusted
- `Real-Time Performance Panel`
    - only for M10+ clusters
- `Atlas CLI`

```bash
atlas metrics processes <hostname:port> <options>

atlas auth login
# following Atlas CLI command to retrieve connection metrics for one cluster node.
atlas metrics processes ac-hgeddrt-shard-00-00.odqjme8.mongodb.net:27017 --period P1D --granularity PT5M --output json --type CONNECTIONS
```

### Configure Alerts

- different alerts at `Organization` and `Project` levels
- You must have the `Project Owner` role to configure `Project` level alerts
- Alerts can be configured for any metric across all cluster tiers, however shared-cluster tiers only trigger alerts
  related to the supported metrics in those clusters
    - `Connections`
    - `Logical size`
    - `Opcounters`
    - `Network`
- Projects are created with a set of default alert settings

```bash
$ atlas alerts settings list
$ atlas alerts settings create
$ atlas alerts settings update
$ atlas alerts settings delete
```

### Respond to Alerts

- When an alert is issued a warning signal is displayed on the cluster and an alert notification is sent.
- Then notification is sent until the alert is acknowledged
- Open Alerts can be acknowledged
- Alerts can be resolved / closed

```bash
// view alerts
# An alert’s status will only change to CLOSED once the condition that triggered the alert is resolved.
$ atlas alerts list --status OPEN --output json
# acknowledge an alert, the alert is not fired until 
# 1. acknowledgment period ends or 
# 2. the error condition is resolved or 
# 3. the alert is manually unacknowledged
$ atlas alerts acknowledge <alertId> --until '2028-01-01T00:00:00.000Z' --comment <comment>
// unacknowledge an alert
$ atlas alerts unacknowledge <alertId>
```

### MongoDB Atlas Integrations for Monitoring

- `Receive Atlas alerts`, 
- `view and analyse performance metrics`
- integrations: `Prometheus`, `DataDog`, `PagerDuty`, etc... (`Prometheus` and `DataDog` are only available on M10+ clusters)

### Self-managed monitoring

- MongoDB recommends [`MongoDB Cloud Manager`](https://www.mongodb.com/products/tools/cloud-manager) to monitor self-managed deployments
- But sometimes is not an option: Use `Prometheus` + `Grafana`
- Create a new database user (test) with the clusterMonitor role

- You need the [`Percona MongoDB Exporter`](https://github.com/percona/mongodb_exporter to get data to Prometheus
  - Retrieves metrics from diagnostic commands and exposes them in Prometheus format
  - Needs a user `db.createUser({user: "test",pwd: "testing",roles: [{ role: "clusterMonitor", db: "admin" },{ role: "read", db: "local" }]})`
- Configure `Percona MongoDB Exporter` as a `Prometheus Target`

### Command line metrics

- monitor apps like `MongoDB Cloud Manager`, or `Percona Prometheus exporter` run this command at regular intervals

#### `serverStatus` - https://www.mongodb.com/docs/manual/reference/command/serverstatus/

- serverStatus is a `diagnostic database command` that returns a document that provides an overview of the database’s
  state, including connection metrics.

```bash
db.runCommand({ serverStatus: 1 })
db.runCommand( { serverStatus: 1 } ).connections
{
  # number of current connections
  current: 10,
  # number of available connections
  available: 838850,
  totalCreated: 70,
  rejected: 0,
  active: 3,
  threaded: 10,
  exhaustIsMaster: Long('0'),
  exhaustHello: Long('2'),
  awaitingTopologyChanges: Long('2'),
  loadBalanced: Long('0')
}
```

#### `currentOp` - https://www.mongodb.com/docs/manual/reference/command/currentop/

- `currentOp` is an `administrative command` that returns a document containing information on in-progress operations for
  the mongod instance
- useful tool to identify slow operations (ex: "planSummary":"COLLSCAN")

```bash
# all currently active operations
db.adminCommand({ currentOp: true, "$all": true, active: true })
```

#### `killOp` - https://www.mongodb.com/docs/manual/reference/command/killop/

- killOp is an `administrative command` that allows us to kill active operations

```bash
db.adminCommand( { killOp: 1, op: <opid>, comment: <any> })
```
