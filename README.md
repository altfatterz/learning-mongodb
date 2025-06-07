### ENABLING AUTHENTICATION FOR A SELF-MANAGED MONGODB DEPLOYMENT

```bash
$ mongod --config ~/projects/mongodb/learning-mongodb/mongod.conf 
```

```bash
security:
   authorization: enabled
```

### ESTABLISHING AUTHORIZATION FOR A SELF-MANAGED MONGODB DEPLOYMENT

With `mongosh` you will be still able to connect using the `localhost` exception as long as you didn't create any users
or roles

```bash
$ use admin
$ db.createUser(
{
    user: "globalUserAdmin",
    pwd: passwordPrompt(),
    roles: [
        { role: "userAdminAnyDatabase", db: "admin" }
    ]
    }
)
$ quit()
$ mongosh --username globalUserAdmin
admin
$ use admin
$ db.getUsers()
{
  users: [
    {
      _id: 'admin.globalUserAdmin',
      userId: UUID('7c23f6c7-f9c1-4d9c-b713-fa7d67c0f345'),
      user: 'globalUserAdmin',
      db: 'admin',
      roles: [ { role: 'userAdminAnyDatabase', db: 'admin' } ],
      mechanisms: [ 'SCRAM-SHA-1', 'SCRAM-SHA-256' ]
    }
  ],
  ok: 1
}
```

Best practice to create all users in the `admin` database
example roles, you can assign to users during creation, or updating the user

```bash
read
readWrite
dbAdmin
dbOwner
readAnyDatabase
userAdminAnyDatabase
```

```bash
db.createUser(
  {
    user: "analystUser",
    pwd: passwordPrompt(),        
    roles: [
      { role: "read", db: "sample_analytics" },
    ]
  }
)

db.createUser(
  {
    user: "analystUser2",
    pwd: passwordPrompt(),        
    roles: [
      { role: "readWrite", db: "sample_analytics" },
    ]
  }
)
```

### Connect with a user to the admin database

```bash
$ mongosh --username analystUser admin
analystUser
$ mongosh --username analystUser2 admin
analystUser2
```

#### Connect directly to a database

```bash
mongosh "mongodb://analystUser@localhost:27017/sample_analytics?authSource=admin"
```

```bash
use sample_analytics
db.accounts.insertOne({
    "account_id": 470650,
    "limit": 10000,
    "products": [
        "CurrencyService",
        "Commodity",
        "InvestmentStock"
    ]}
)
```

#### Revoke roles from user

```bash
db.revokeRolesFromUser(
    "analystUser2",
    [
      { role: "readWrite", db: "sample_analytics" }
    ]
)
```

```bash
db.createUser(
  {
    user: "financeUser",
    pwd: "QmJWh4P8Gk5v4XDa8F79",    
    roles: [
      { role: "readWrite", db: "sample_analytics" },
      { role: "read", db: "sample_supplies" }
    ]
  }
)
```

### MongoDB connection string

- Standard format
    - used to connect to standalone clusters, replica sets, or sharded clusters

```bash
mongodb://
```

- DNS Seed list format
    - provides a DNS server list to our connection string
    - gives more flexibility of deployment
    - ability to change servers in rotation without reconfiguring clients

- The Atlas used a DNS Seed list connection format:
- **srv** section sets the TLS security option to true
- host and optional port number (27017 if not specified)

- Connect with MongoDB Shell:

```bash
mongosh "mongodb+srv://mdb-training-cluster.swnn5.mongodb.net/myFirstDatabase" --apiVersion 1 --username MDBUser
```

- Connect your application:

```bash
mongodb+srv://MDBUser:<password>@mdb-training-cluster.swnn5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
```

- Connect using MongoDB Compass

```bash
mongodb+srv://MDBUser:<password>@mdb-training-cluster.swnn5.mongodb.net/test
```

### SECURITY AUDITING IN MONGODB

- MongoDB Enterprise has this feature

- Audit output destinations:
    - syslog - JSON output
    - console - JSON output
    - file - JSON or BSON

`mongod.conf`

```bash
auditLog:
  destination: file
  format: JSON
  path: /var/log/mongodb/auditLog.json
```

--auditDestination command line for mongod

Failed authentication

```bash
$ mongosh localhost:27017/admin --username badUser --password incorrectPassword
```

```bash
$ tail /Users/altfatterz/apps/mongodb/audit/auditLog.json | jq .
```

```json
{
  "atype": "authenticate",
  "ts": {
    "$date": "2024-08-16T17:00:33.857+02:00"
  },
  "uuid": {
    "$binary": "SCQLbHpOTMil/2Rz8PRTiw==",
    "$type": "04"
  },
  "local": {
    "ip": "127.0.0.1",
    "port": 27017
  },
  "remote": {
    "ip": "127.0.0.1",
    "port": 59663
  },
  "users": [],
  "roles": [],
  "param": {
    "user": "badUser",
    "db": "admin",
    "mechanism": "SCRAM-SHA-1"
  },
  "result": 11
}
```


### Encryption concepts

- transport encryption
    - TLS/SSL is used to encrypt all of MongoDB’s network traffic.
    - available for community or enterprise version
    - MongoDB Atlas TLS is enabled by default and cannot be disabled
    - In self-managed deployment is not enabled by default
    - In sefl-managed environment have TLS certificate for each server in pem format.
- encryption at rest
    - It encrypts data in storage on the server.
    - only enterprise offers and encrypted enterprise option
        - enables you to natively encrypt MongoDB datafiles on disk.
        - only parties with decryption key can decode and read the data
- in-use encryption - protects when the data is in memory
    - Client-Side Field Level Encryption (CSFLE) encrypts data in the client before it's sent to the database.
        - this is basically also at-rest encryption
    - This ensures data is tamper- and read-proof on the server.
    - Available for community or enterprise version
        - MongoDB Community
            - uses explicit encryption
            - must specify encryption logic manually by using the mongodb drivers encryption library
        - MongoDB Enterprise
            - supports automatic encryption in addition to explicit encryption
            - define encrypted fields using JSON Schema, then the driver encrypts / decrypts fields automatically
    - the MongoDB never has access to your most sensitive data in unencrypted form and never has the decryption keys
    - the client gets a keys from a management system end encrypts and decrypts as needed
    - the client only sends encrypted data or queries with encrypted values to the server

### TLS enable

```yaml
net:
  tls:
    mode: requireTLS
    # the file contains both the certificate and the private key
    certificateKeyFile: /etc/tls/mongodb.pem
    # Specify that the server allows invalid TLS certificates (as we are creating our own)
    allowInvalidCertificates: true
    # Specify that the server allows invalid hostnames.
    allowInvalidHostnames: true
replication:
  replSetName: TLSEnabledReplSet  
```

The client with the `root-ca.pem` can validate the certificate presented by the server

```bash
$ mongosh "mongodb://mongod0.replset.com/?tls=true&tlsCAFile=/etc/tls/root-ca.pem"
$ use admin
# Use the rs.initiate() method to create a replica set:
rs.initiate(
  {
     _id: "TLSEnabledReplSet",
     version: 1
     members: [
        { _id: 0, host : "mongod0.replset.com" },
        { _id: 1, host : "mongod1.replset.com" },
        { _id: 2, host : "mongod2.replset.com" }
     ]
  }
) 

$ db.hello().isWritablePrimary
true
```

The prompt will switch to `primary` this indicates that the replica set has been initiated.

```bash
$ $ mongosh "mongodb://mongod0.replset.com,mongod1.replset.com,mongod2.replset.com/?replicaSet=TLSEnabledReplSet&tls=true&tlsCAFile=/etc/tls/root-ca.pem"
```

This should work

```bash
$ mongosh "mongodb://mongod0.replset.com,mongod1.replset.com,mongod2.replset.com/?replicaSet=TLSEnabledReplSet" 
```

This should fail

### tlsUseSystemCA - available for mongod only.

https://www.mongodb.com/docs/manual/reference/parameters/#mongodb-parameter-param.tlsUseSystemCA

Specifies whether MongoDB loads TLS certificates that are already available to the operating system's certificate
authority.

```bash
$ mongod --config /etc/mongod_1.conf --setParameter tlsUseSystemCA=true
```

Other options:

- `--tlsCAFile` parameter
- `tls.CAFile` configuration


