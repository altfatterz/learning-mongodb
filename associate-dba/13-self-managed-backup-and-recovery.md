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

### Backup and restore a MongoDB Deployment using a snapshot

- We use the Linux `Logical Volume Manager` and the `tar` utility

- `Logical Volume Manager` (LVM) - https://en.wikipedia.org/wiki/Logical_Volume_Manager_(Linux)
  -  It allows you to combine multiple physical hard drives or SSDs into a single virtual storage pool (`volume group`) and create `logical volumes` within that pool.
  - `Physical Volumes (PVs)`: A disk or partition is marked as a Physical Volume.
  - `Volume Groups (VGs`): PVs are combined into a `Volume Group`, a pool of available storage.
  - `Logical Volumes (LVs)`: You create logical volumes within the Volume Group, which are virtual partitions.
  - `Filesystem`: You create a filesystem (e.g., ext4, XFS) on the logical volume.
- `dd` utility - https://en.wikipedia.org/wiki/Dd_(Unix)
  - allows you to convert and copy data

Example of our MongoDB deployment
- we created a PV on one of hard drives
- in this PV we created a `Volume Group` `vg0`
- inside the `Volume Group` `vg0` we created a 600MB `logical volume` `mdb`
- the `mdb` is mounted to the data files located at `/var/lib/mongodb`

```bash
# lock the database, no write operations possible, and flushes write operations that have not been written to the disk
mongosh
db.fsyncLock();
exit
# create a snapshot volume
sudo lvcreate --size 100M --snapshot --name mdb-snapshot /dev/vg0/mdb;
# to check that the snapshot was created
sudo lvs
# unlock the database
mongosh
# this is important otherwise no writes are possible
db.fsyncUnlock(); 
exit
# archive the snapshot
sudo dd status=progress if=/dev/vg0/mdb-snapshot | gzip > mdb-snapshot.gz
# restore the archived snapshot
# create a new logical volume named mbd-new
sudo lvcreate --size 1G --name mdb-new vg0;
# extract the snapshot and write it to the new logical volume:
gzip -d -c mdb-snapshot.gz | sudo dd status=progress of=/dev/vg0/mdb-new
# stop the MongoDB service before mounting to the source directory:
sudo systemctl stop -l mongod; sudo systemctl status -l mongod;
# Delete any existing MongoDB data files. This is for demonstration purposes to show how the entire deployment is restored.
sudo rm -r /var/lib/mongodb/*
# Next, unmount the MongoDB deployment so that you can mount the newly restored logical volume in its place.
sudo umount /var/lib/mongodb
# Mount the restored logical volume on the MongoDB database directory:
sudo mount /dev/vg0/mdb-new /var/lib/mongodb
# start the MongoDB service and connect to the deployment
sudo systemctl start -l mongod; sudo systemctl status -l mongod;
mongosh
show dbs
```

### Backup and restore a MongoDB Deployment using an archive file taken from the filesystem of volume snapshot

- We use the Linux `Logical Volume Manager` and the `tar` (Tape Archive) utility

Example of our MongoDB deployment
- we created a PV on one of hard drives
- in this PV we created a `Volume Group` `vg0`
- inside the `Volume Group` `vg0` we created a 600MB `logical volume` `mdb`
- the `mdb` is mounted to the data files located at `/var/lib/mongodb`

```bash
# lock the database
mongosh
db.fsyncLock();
exit
# create a snapshot volume
sudo lvcreate --size 100M --snapshot --name mdb-snapshot /dev/vg0/mdb;
# to check that the snapshot was created
sudo lvs
# unlock the database
mongosh
# this is important otherwise no writes are possible
db.fsyncUnlock(); 
exit
# archive the snapshot
mkdir /tmp/mongodbsnap
# mount the snapshot volume taken previously as read-only
sudo mount -t xfs -o nouuid,ro /dev/vg0/mdb-snapshot /tmp/mongodbsnap/
# use tar to create a new archive of all the files in the mongodbsnap directory
sudo tar -czvf mdb-snapshot.tar.gz -C /tmp/mongodbsnap/ .
# restore the archived snapshot
sudo mkdir /mdb
# extract the compressed archive to the newly created directory
sudo tar -xzf mdb-snapshot.tar.gz -C /mdb
sudo systemctl stop -l mongod; sudo systemctl status -l mongod;
# change the owner to mongodb user otherwise the service will fail to start
sudo chown -R mongodb:mongodb /mdb 
# set it in the /etc/mongod.conf
storage:
  dbPath: /mdb   
# start the MongoDB service and connect to the deployment
sudo systemctl start -l mongod; sudo systemctl status -l mongod;
mongosh
show dbs
```

### Backing up a MongoDB Deployment

- `mongodump`
    - not ideal for large systems, but well suited for small deployments
    - should not be used for `sharded clusters`
    - for `production quality backup and recovery` use
      - `MongoDB Atlas`
      - `MongoDB Cloud Manager`
      - `MongoDB Ops Manager`

Example: use `mongodump` to backup a replica set - the result will be BSON file which can be compressed
    
```bash
# connect to the admin database where we will create the backup-admin user
mongosh mongodb://restore-admin@mongod0.repleset.com:27017,mongod1.replset.com:27017,mongod2.replset.com:27017/admin&replicaSet=replset
# Create a User with the `backup` Role
db.createUser({ user: "backup-admin", pwd: "backup-pass", roles: ["backup"]})

# `oplog` option captures incoming write operations during the mongodump operation.
# the result provides and effective point-in-time (when the backup is completed) snapshot of the deployment
# `gzip` option compresses the output file.
# `archive` option is used to specify the file location for the dump file.
# the read preference is also set in the connection string to reduce any performance impact (creates traffic and force the database to read all data into memory)
# using anything than primary means we can have stale data
mongodump \
--oplog \
--gzip \
--archive=mongodump-april-2023.gz  \
“mongodb://backup-admin@mongod0.repleset.com:27017,mongod1.replset.com:27017,mongod2.replset.com:27017/?authSource=admin&replicaSet=replset&readPreference=secondary”

# create a backup for `neighborhoods` collection of the `sample_restaurants` database
# `oplog` option cannot be used in this case
mongodump \
--collection=neighborhoods \
--gzip \
--archive=mongodump-neighborhoodss-2023.gz \
"mongodb://backup-admin:@mongod0.repleset.com:27017,mongod1.replset.com:27017,mongod2.replset.com:27017/sample_restaurants?authSource=admin&replicaSet=replset"
```

### Restoring a MongoDB Deployment

- `mongorestore`
  - can be used with smaller deployments
  - we must ensure that the source and target `major versions` are the same
  - same version of `mongorestore` as the version of `mongodump`

Example: restore a replica set

```bash
# connect to the admin database where we will create the restore-admin user
mongosh mongodb://restore-admin@mongod0.repleset.com:27017,mongod1.replset.com:27017,mongod2.replset.com:27017/admin&replicaSet=replset
# Create a User with the `restore` role
db.createUser({ user: "restore-admin", pwd: "restore-pass", roles: ["restore"] })
# Use mongorestore to Restore a Database
# The --drop option removes any existing collections from the database.
# The --gzip option is used to restore from a compressed file.
# The --oplogReplay option replays the oplog entries from the oplog.bson file.
# The --noIndexRestore option is used to reduce the impact on the system. You will need to recreate the indexes later
# The --archive option is used to specify the file location of the dump file. 

mongorestore \
--drop \
--gzip \
--oplogReplay \
--noIndexRestore \
--archive=mongodump-april-2023.gz \
"mongodb://restore-admin@mongod0.repleset.com:27017,mongod1.replset.com:27017,mongod2.replset.com:27017/?authSource=admin&replicaSet=replset"
```
