## 13 - Self-Managed Backup & Recovery

### Backup plans on a MongoDB Server

- `Backup plan`
    - Important:
        - Keep business functional during an `unforeseen event`
        - Satisfying `regulatory obligations`
    - How to back up data
    - How often data is backed up
    - How long to retain backup data
    - Where to store backup data
    - What tools you need to use `file system snapshots` or included tools like `mongodump`, `mongorestore`, or others
        - ex: `mongodump` is not ideal for large systems buy may be appropriate for a small IoT devices

- `Recovery Point Objectives` (RPO)
    - Maximum acceptable amount of data loss that a business is willing to tolerate in the event of a disruption
      `expressed in an amount of time`
    - Example:
        - a business decides that 2 hours of data loss is acceptable
        - they experience an outage at 12 PM
        - the business needs to recover all data that was recorded before 10 AM

- `Recovery Time Objectives` (RTO)
    - `Maximum amount of time` that a business can tolerate after an outage before the disruption makes normal business
      operations intolerable
    - Example
        - a business has an RTO of 3 hours
        - all systems must be running by 3 hours after an outage at most

### Filesystem snapshots on a MongoDB Server

Notes: 
    - common and robust way to create backups on Linux systems
    - a snapshot is a complete copy of your data at a specific point in time
    - snapshots can be used on all size systems, large or small
    - snapshots work by creating pointers between a `source volume` and the `snapshot volume`
    - a `snapshot volume` is `point-in-time`,`read-only` view of the `source volume`
    - a `volume` is a container with a filesystem that allows us to store and access data
    - snapshots can be created with different tools
        - `Logical Volume Manager for Linux`
        - `MongoDB Ops Manager`
        - `MongoDB Atlas`
        - Most cloud providers have their own tools as well
    - Before taking a snapshot we need the database to be locked with `fsnycLock()` command
        - `fsyncLock()`
            - forces MongoDB to flush all pending write operations to disk
            - locks the entire instance to prevent additional writes until the `fsyncUnlock()` command
    - The `source volume` may contain more than just your MongoDB deployment
        - may lead to very large snapshot volume archives
        - MongoDB recommends isolating your MongoDB deployment to prevent very large snapshot volume archives
    - Important to create a snapshot of your entire deployment
        - for example `journal` might be stored somewhere else for performance reasons
        - the `journal` is a sequential binary transaction log that is used to bring the database into valid state in
          case of a hard shutdown
        - if the `journal` is not part of your snapshot, the snapshot will be incomplete
    - What happens after the snapshot is created -> how to extract data from snapshot for offline storage, two methods here:
        - `Snapshot volume archive`
            - complete copy of the source volume, plus and change that occurred while the snapshot was being created (Linux `dd` utility)
            - could be large
        - `Filesystem archive`
            - mounting the `snapshot volume` and using filesystem tools such as `tar` to archive the actual files
            - this is smaller archive than the previous option
    - It’s a good idea to store your backups on a separate server from the MongoDB deployment. This allows you to easily
      access your backups in case your MongoDB deployment server becomes unavailable. It also allows you to save server
      resources for your deployment server.

### Filesystem snapshot volumes on a MongoDB Server

### Filesystem archives on a MongoDB Server

### Backing up a MongoDB Deployment

### Restoring a MongoDB Deployment

