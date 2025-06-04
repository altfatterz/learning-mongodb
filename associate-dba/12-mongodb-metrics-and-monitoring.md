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

### Respond to Alerts

### Integrations

