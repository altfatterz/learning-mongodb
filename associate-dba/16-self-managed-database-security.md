## 16 - Self-Managed Database Security

### Introduction to security

`Triple A's`:

- `Authentication`
  - verify the identity of users
- `Authorization`
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

With `mongosh` you will be still able to connect using the `localhost` exception as long as you didn't create any users or roles

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

- Best practice to create all users in the `admin` database

### Establishing authorization for self-managed MongoDB deployment

### Security auditing in MongoDB

### Introduction to encryption concepts

### Encryption in self-managed MongoDB deployments

### Enabling network encryption for self-managed MongoDB deployment