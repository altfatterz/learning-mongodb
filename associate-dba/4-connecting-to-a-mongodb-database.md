## 4 - Connecting to a MongoDB Database

### Connection String

- `Standard format`
  - standalone cluster
  - replica sets
  - sharded clusters

- `DNS Seed List Format` (used in Atlas)
- provides the ability to change servers in rotation without reconfiguring clients

`mongodb+srv://<username>:<password>@<host>[:<port>]?<options>`
`mongodb+srv://<username>:<password>@mdb-training-cluster.swnn5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

`mongosh "mongodb+srv://demo-cluster.odqjme8.mongodb.net/" --apiVersion 1 --username altfatterz`


### Mongo Shell

```bash
rs0 [direct: primary] test> const greetingArray = ["hello", "world", "welcome"]
rs0 [direct: primary] test> const loopArray = (array) => array.forEach(e => console.log(e))
rs0 [direct: primary] test> loopArray(greetingArray)
hello
world
welcome
rs0 [direct: primary] test> 
```

### MongoDB Compass https://www.mongodb.com/products/tools/compass

### MongoDB Developer Center https://www.mongodb.com/developer/

### Troubleshooting connection errors: https://www.mongodb.com/docs/atlas/troubleshoot-connection/

