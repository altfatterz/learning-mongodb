## MongoDB with Docker

### Running one node ReplicaSet with Docker

- A `replica set`, also known as a `cluster`, provides redundancy and availability.
- Enable authentication

```bash
openssl rand -base64 756 > mongo-keyfile
chmod 400 mongo-keyfile
```

- Create the admin user by connecting with to the instance wihin the container

```bash
mongosh 
use admin
db.createUser( {user: "admin", pwd: passwordPrompt(), roles: [{ role: "userAdminAnyDatabase", db: "admin" }]})
```

- Now we can connect with user `admin`

```bash
docker compose -f mongodb-single-node.yaml up

docker exec -it <> bash

mongosh --port 27017
rs0 [direct: primary] test> rs.status()

# cleanup
docker compose -f mongodb-single-node.yaml down -v
```

### Running three node ReplicaSet with Docker

```bash
docker compose -f mongodb-three-node.yaml up -d

docker ps 
CONTAINER ID   IMAGE                                         COMMAND                  CREATED          STATUS                    PORTS                                 NAMES
3309b3ee18b2   mongodb/mongodb-community-server:8.0.9-ubi9   "python3 /usr/local/…"   13 seconds ago   Up 13 seconds (healthy)   0.0.0.0:27017->27017/tcp              mongo1
96ff955e3a3a   mongodb/mongodb-community-server:8.0.9-ubi9   "python3 /usr/local/…"   13 seconds ago   Up 13 seconds             27017/tcp, 0.0.0.0:27018->27018/tcp   mongo2
485d655fa76a   mongodb/mongodb-community-server:8.0.9-ubi9   "python3 /usr/local/…"   13 seconds ago   Up 13 seconds             27017/tcp, 0.0.0.0:27019->27019/tcp   mongo3

docker volume ls 

mongosh --port 27017
rs0 [direct: primary] test>

mongosh --port 27018
rs0 [direct: secondary] test>

# cleanup
docker compose -f mongodb-three-node.yaml down -v
```

### Sample Data

https://www.mongodb.com/docs/atlas/sample-data/

Backup from Atlas:

```bash
# backup the sample_analytics database
mongodump -v --gzip --archive=sample_analytics_backup.gz \
 "mongodb+srv://altfatterz@demo-cluster.odqjme8.mongodb.net/sample_analytics"
```

Restore to local mongodb instance:

```bash
mongorestore -v --gzip --archive=sample_analytics_backup.gz --drop "mongodb://localhost:27017"
```


### Download Sample Data

```bash
curl  https://atlas-education.s3.amazonaws.com/sampledata.archive -o sampledata.archive
```