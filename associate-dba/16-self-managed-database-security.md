## 16 - Self-Managed Database Security

### Introduction to security

`Triple A's`:

- `Authentication` - https://www.mongodb.com/docs/manual/core/authentication/
    - verify the identity of users
- `Authorization` - https://www.mongodb.com/docs/manual/core/authorization/
    - determines the specific permissions that user has on a database
    - RBAC approach, assigning permissions to roles
    - ex: `DeveloperRole`
- `Auditing`
    - process of monitoring and recording the changes to data and database configuration
    - ex: record and audit log entry when a collection is dropped from the database
    - purpose:
        - comply with regulatory requirements
        - support analysis of security incidents

### Enabling authentication for self-managed MongoDB deployment

```bash
$ mongod --config ~/projects/mongodb/learning-mongodb/mongod.conf 
```

```bash
security:
   authorization: enabled
```

`Scram` (Salted Challenge Response Authentication Mechanism) - https://www.mongodb.com/docs/manual/tutorial/configure-scram-client-authentication/

`Localhost exception` - https://www.mongodb.com/docs/manual/core/localhost-exception/
With `mongosh` you will be still able to connect using the `localhost` exception as long as you didn't create any users
or roles

```bash
$ use admin
# still works
$ show dbs 
$ db.createUser( {user: "admin", pwd: passwordPrompt(), roles: [{ role: "userAdminAnyDatabase", db: "admin" }]})
# after the user is created you no longer have access
$ show dbs

$ quit()
$ mongosh --username admin
admin
$ use admin
$ db.getUsers()
{
  users: [
    {
      _id: 'admin.admin,
      userId: UUID('7c23f6c7-f9c1-4d9c-b713-fa7d67c0f345'),
      user: 'admin',
      db: 'admin',
      roles: [ { role: 'userAdminAnyDatabase', db: 'admin' } ],
      mechanisms: [ 'SCRAM-SHA-1', 'SCRAM-SHA-256' ]
    }
  ],
  ok: 1
}
```

- Best practice to create all users in the `admin` database,
- `admin` database will be authentication database but users can have still privileges on other databases

### Establishing authorization for self-managed MongoDB deployment

Built-in roles: https://www.mongodb.com/docs/manual/reference/built-in-roles/
- Assign / remove a built-in role to a database user
- Roles can be assigned during creating a user or when updating a user
- example roles:

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
```

Connect as `analystUser`

```bash
mongosh "mongodb://analystUser@localhost:27017/sample_analytics?authSource=admin"
```

Revoke roles from a user - https://www.mongodb.com/docs/manual/tutorial/manage-users-and-roles/#modify-access-for-an-existing-user

```bash
db.revokeRolesFromUser(
    "analystUser",
    [
      { role: "read", db: "sample_analytics" }
    ]
)
```

### Security auditing in MongoDB - https://www.mongodb.com/docs/manual/core/auditing/

- `MongoDB Enterprise` includes an auditing capability
- `Destinations` where audit events can be printed
    - `Syslog` - in JSON format
    - `Console` - in JSON format
    - `File` - in JSON or BSON format
- Enable auditing and set the output destination
    - `--auditDestination` command line option
    - `auditLog.destination` option in configuration file
- Procedure for accessing audit log file - check configuration in `/etc/mongod.conf`

```bash
auditLog:
  destination: file
  format: JSON
  path: /var/log/mongodb/auditLog.json
```

```bash
sudo /var/log/mongodb/auditLog.json | jq .

# two important fields
{
  "atype": "logout" # action type
  "result": 0 # error code of the action
  ...
}
```

### Introduction to encryption concepts / Encryption in self-managed MongoDB deployments

- `transport encryption` - https://www.mongodb.com/docs/manual/core/security-transport-encryption/
    - TLS/SSL is used to encrypt all of MongoDB’s network traffic.
    - available for community or enterprise version
    - MongoDB Atlas TLS is enabled by default and cannot be disabled
    - in self-managed deployment is not enabled by default
    - in self-managed environment have TLS certificate for each server in pem format.
- `encryption at rest` - https://www.mongodb.com/docs/manual/core/security-encryption-at-rest/
    - It encrypts data in storage on the server.
    - MongoDB Enterprise offers Encrypted Storage Engine
        - enables you to natively encrypt MongoDB datafiles on disk.
        - only parties with decryption key can decode and read the data
- `in-use encryption` - protects when the data is in memory on the server - https://www.mongodb.com/docs/manual/core/security-in-use-encryption/
  -  encrypts data in the client before it's sent to the database, making it tamper and read-proof on the server
      - Client-Side Field Level Encryption (`CSFLE`) - encrypts individual fields before is sent to the server
      - the server never has access to your data in unencrypted form, never has the decryption keys
      - the client hav access to the key management system and encrypts / decrypts specific fields as needed
      - the client sends encrypted data or queries with encrypted values to the server
      - available for MongoDB community and MongoDB Enterprise with a major difference
        - MongoDB Community - use explicit encryption - must specify the encryption logic manually
        - MongoDB Enterprise - supports automatic encryption in addition to explicit encryption - define encrypted fields with JSON schema
        Limitations https://www.mongodb.com/docs/manual/core/csfle/reference/limitations/#std-label-csfle-reference-encryption-limits
  - Queryable Encryption - https://www.mongodb.com/docs/manual/core/queryable-encryption/#std-label-qe-manual-feature-qe

### Enabling network encryption for self-managed MongoDB deployment - https://www.mongodb.com/docs/manual/tutorial/upgrade-cluster-to-ssl/

- In MongoDB Atlas TLS is enabled by default and cannot be disabled
- In self-managed deployment TLS is disabled by default
- You must have a TLS certificate for each server in PEM file format

```yaml
# example configuration in /etc/mongod.conf
# net options: https://www.mongodb.com/docs/manual/reference/configuration-options/?_ga=2.149826678.1926118966.1686611566-1191611927.1686611566#net-options
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
# This should work
$ mongosh "mongodb://mongod0.replset.com,mongod1.replset.com,mongod2.replset.com/?replicaSet=TLSEnabledReplSet&tls=true&tlsCAFile=/etc/tls/root-ca.pem"
```

```bash
# This should fail
$ mongosh "mongodb://mongod0.replset.com,mongod1.replset.com,mongod2.replset.com/?replicaSet=TLSEnabledReplSet" 
```

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


