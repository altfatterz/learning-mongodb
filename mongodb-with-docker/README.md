## MongoDB with Docker

### Running one node ReplicaSet with Docker

- A `replica set`, also known as a `cluster`, provides redundancy and availability.

- Startup a single node replica set

```bash
docker compose -f mongodb-single-node-without-auth.yaml up -d
```

```bash
mongosh
 
rs0 [direct: primary] test> rs.status()
rs0 [direct: primary] test> db.hello() 
rs0 [direct: primary] test> db.version()
```

- Load sample data

```bash
# the archive was download using: curl https://atlas-education.s3.amazonaws.com/sampledata.archive -o sampledata.archive 
cd ~/apps/mongodb
mongorestore -v --archive="sampledata.archive" --drop "mongodb://localhost:27017"
```

```bash
rs0 [direct: primary] test> show dbs()
admin                80.00 KiB
config              132.00 KiB
local               192.27 MiB
sample_airbnb        52.13 MiB
sample_analytics      8.80 MiB
sample_geospatial     1.14 MiB
sample_guides        40.00 KiB
sample_mflix        110.15 MiB
sample_restaurants    6.38 MiB
sample_supplies       1.03 MiB
sample_training      45.92 MiB
sample_weatherdata    2.55 Mi
```

- Cleanup

```bash
docker compose -f mongodb-single-node-without-auth.yaml down -v
```

### Running one node ReplicaSet with Docker with auth enabled

- A `replica set`, also known as a `cluster`, provides redundancy and availability.
- Enable authentication
- Create a keyfile

```bash
openssl rand -base64 756 > mongo-keyfile
chmod 400 mongo-keyfile
```

- Startup a single node replica set

```bash
docker compose -f mongodb-single-node.yaml up -d
```

- Create the admin user by connecting with to the instance within the container (`localhost exception`)

```bash
docker exec -it mongo1 sh
mongosh 
use admin
db.createUser( {user: "admin", pwd: passwordPrompt(), roles: [{ role: "userAdminAnyDatabase", db: "admin" }]})
```

- Now we can connect with user `admin` outside of the container

```bash
mongosh --username admin
use admin
# needed for rs.status()
db.grantRolesToUser('admin', [{ role: 'root', db: 'admin' }])
 
rs0 [direct: primary] test> rs.status()
rs0 [direct: primary] test> db.hello() # no authentication needed
rs0 [direct: primary] test> db.version() # no authentication needed
```

```bash
# the archive was download using: curl https://atlas-education.s3.amazonaws.com/sampledata.archive -o sampledata.archive 
cd ~/apps/mongodb
mongorestore -v --archive="sampledata.archive" --drop "mongodb://admin@localhost:27017"
```

```bash
rs0 [direct: primary] test> show dbs()
admin                80.00 KiB
config              132.00 KiB
local               192.27 MiB
sample_airbnb        52.13 MiB
sample_analytics      8.80 MiB
sample_geospatial     1.14 MiB
sample_guides        40.00 KiB
sample_mflix        110.15 MiB
sample_restaurants    6.38 MiB
sample_supplies       1.03 MiB
sample_training      45.92 MiB
sample_weatherdata    2.55 Mi
```

- Cleanup

```bash
docker compose -f mongodb-single-node.yaml down -v
```

### Running three node ReplicaSet with Docker with auth enabled

```bash
docker compose -f mongodb-three-node.yaml up -d

docker ps 
CONTAINER ID   IMAGE                                         COMMAND                  CREATED          STATUS                    PORTS                                 NAMES
3309b3ee18b2   mongodb/mongodb-community-server:8.0.9-ubi9   "python3 /usr/local/…"   13 seconds ago   Up 13 seconds (healthy)   0.0.0.0:27017->27017/tcp              mongo1
96ff955e3a3a   mongodb/mongodb-community-server:8.0.9-ubi9   "python3 /usr/local/…"   13 seconds ago   Up 13 seconds             27017/tcp, 0.0.0.0:27018->27018/tcp   mongo2
485d655fa76a   mongodb/mongodb-community-server:8.0.9-ubi9   "python3 /usr/local/…"   13 seconds ago   Up 13 seconds             27017/tcp, 0.0.0.0:27019->27019/tcp   mongo3

docker volume ls 
```

- Create the admin user by connecting with to the instance within the container (`localhost exception`)

```bash
docker exec -it mongo1 sh
mongosh 
use admin
db.createUser( {user: "admin", pwd: passwordPrompt(), roles: [{ role: "userAdminAnyDatabase", db: "admin" }]})
# needed for rs.status()
```

- Now we can connect with user `admin` outside of the container

```bash
mongosh --port 27017 --username admin
use admin
# needed for rs.status()
db.grantRolesToUser('admin', [{ role: 'root', db: 'admin' }])
 
rs0 [direct: primary] test> rs.status()
rs0 [direct: primary] test> db.hello() # no authentication needed 
rs0 [direct: primary] test> db.version() # no authentication needed
```

mongosh --username admin --port 27018
rs0 [direct: secondary] test>

mongosh --username admin --port 27019
rs0 [direct: secondary] test>

- Cleanup

```bash
docker compose -f mongodb-three-node.yaml down -v
```


```bash
mongosh --username admin
admin               252.00 KiB
config              144.00 KiB
local               192.31 MiB
show dbs
sample_airbnb        52.67 MiB
sample_analytics      9.47 MiB
sample_geospatial     1.14 MiB
sample_guides        40.00 KiB
sample_mflix        109.91 MiB
sample_restaurants    6.35 MiB
sample_supplies       1.03 MiB
sample_training      46.10 MiB
sample_weatherdata    2.55 MiB


```

### Generate Data

```bash
# node_modules is created in the mongodb-with-docker folder
npm install --save-dev @faker-js/faker

mongosh
# https://www.mongodb.com/docs/manual/reference/method/js-native/
rs0 [direct: primary] test> load("fakeUsers.js")
Inserting fake users ...
true
rs0 [direct: primary] test> load("fakeUsers.js")
rs0 [direct: primary] test> use fake-db
rs0 [direct: primary] fake-db> db.users.countDocuments()
10      
rs0 [direct: primary] fake-db> db.users.findOne()
{
  _id: ObjectId('6849491a74774afc9b3b1916'),
  name: 'Julius Dach',
  email: 'Darion_MacGyver98@hotmail.com',
  phone: '1-890-668-8591'
}
```

### Atlas - https://www.mongodb.com/docs/atlas/sample-data/

- Connect

```bash
# password in 1Password
mongosh "mongodb+srv://demo-cluster.odqjme8.mongodb.net/" --apiVersion 1 --username altfatterz
```

Backup from Atlas:

```bash
# backup the sample_analytics database
mongodump -v --gzip --archive=sample_analytics_backup.gz "mongodb+srv://altfatterz@demo-cluster.odqjme8.mongodb.net/sample_analytics"
```

Restore to local mongodb instance:

```bash
mongorestore -v --gzip --archive=sample_analytics_backup.gz --drop "mongodb://localhost:27017"
```