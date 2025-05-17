### Running Locally


https://hub.docker.com/r/mongodb/mongodb-community-server


```bash
docker pull mongodb/mongodb-community-server:8.0.9-ubi9
docker run --name mongodb -p 27017:27017 -d mongodb/mongodb-community-server:8.0.9-ubi9
docker container ls

CONTAINER ID   IMAGE                                     COMMAND                  CREATED         STATUS         PORTS                      NAMES
62370ecbf909   mongodb/mongodb-community-server:latest   "python3 /usr/local/…"   2 seconds ago   Up 2 seconds   0.0.0.0:27017->27017/tcp   mongodb
```

Connect:

```bash
brew install mongosh

which mongosh
/opt/homebrew/bin/mongosh

mongosh --version
2.5.1

mongosh --port 27017
Current Mongosh Log ID:	68286ac37eab055e127a5515
Connecting to:		mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.1
Using MongoDB:		8.0.9
Using Mongosh:		2.5.1

# Validate Your Deployment
db.runCommand({hello: 1})

{
  isWritablePrimary: true,
  topologyVersion: {
    processId: ObjectId('68286a9e618512fab5a4db5b'),
    counter: Long('0')
  },
  maxBsonObjectSize: 16777216,
  maxMessageSizeBytes: 48000000,
  maxWriteBatchSize: 100000,
  localTime: ISODate('2025-05-17T10:55:45.304Z'),
  logicalSessionTimeoutMinutes: 30,
  connectionId: 4,
  minWireVersion: 0,
  maxWireVersion: 25,
  readOnly: false,
  ok: 1
}
```


```bash

```

### Verify MongoDB's signature for container images with cosign

[Cosign](https://github.com/sigstore/cosign) -> Signing OCI containers (and other artifacts) using [Sigstore](https://www.sigstore.dev/)
Sigstore - Making sure your software is what it claims to be.

```bash
brew install cosign
which cosign
/opt/homebrew/bin/cosign
# Download the MongoDB Server container image's public key
curl https://cosign.mongodb.com/server.pem > server.pem
# Verify the signature
COSIGN_REPOSITORY=docker.io/mongodb/signatures cosign verify --private-infrastructure --key=./server.pem docker.io/mongodb/mongodb-community-server:latest

Verification for index.docker.io/mongodb/mongodb-community-server:latest --
The following checks were performed on each of these signatures:
  - The cosign claims were validated
  - The signatures were verified against the specified public key

[{"critical":{"identity":{"docker-reference":"index.docker.io/mongodb/mongodb-community-server"},"image":{"docker-manifest-digest":"sha256:49d4d2c074f5aba99e04dc89167cf383a21017e1555036fe4a5a8c12194dcc99"},"type":"cosign container image signature"},"optional":null}]
```

### Running MongoDB with TestContainers

- Makes sure you have a Docker environment
- Run `TestMongoDBApp`

### Running one node ReplicaSet with Docker

- A `replica set`, also known as a `cluster`, provides redundancy and availability.

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

