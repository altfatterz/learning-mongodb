
### Install `mongod`

https://www.mongodb.com/docs/manual/installation/

I have the enterprise version into my `~/apps` folder and set the path in my `.zshrc`

```bash
export MONGODB_HOME=~/apps/mongodb-macos-x86_64-enterprise-7.0.9
export PATH="$MONGODB_HOME/bin:$PATH"
```

### Install `Mongo Shell` (mongosh)

https://www.mongodb.com/docs/mongodb-shell

I have the enterprise version into my `~/apps` folder and set the path in my `.zshrc`

```bash
export MONGOSHELL_HOME=~/apps/mongosh-2.2.5-darwin-x64
export PATH="$MONGOSHELL_HOME/bin:$PATH"
```

### Start up `mongod` process:

```bash
$ mongod --dbpath ~/apps/mongodb/db --logpath ~/apps/mongodb/log/mongo.log
```

### Start `mongosh`

```bash
$ mongosh

Current Mongosh Log ID:	6633a530e3408e2697a514f8
Connecting to:		mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.5
Using MongoDB:		7.0.9
Using Mongosh:		2.2.5
```

Connect to Atlas database:

```bash
$ mongosh "mongodb+srv://demo-cluster.odqjme8.mongodb.net/" --apiVersion 1 --username altfatterz
```

### Install `MongoDB Compass`

https://www.mongodb.com/try/download/compass

Compass 1.43.0 is installed successfully

Create connections:

```bash
local -> mongodb://localhost:27017
Altas DB -> mongodb+srv://altfatterz:<password>@demo-cluster.odqjme8.mongodb.net/
```

### Install Atlas CLI

```bash
export MONGODB_ATLAS_HOME=~/apps/mongodb-atlas-cli_1.22.0_macos_x86_64
export PATH="$MONGODB_ATLAS_HOME/bin:$PATH"
```

```bash
$ atlas setup
$ atlas clusters list
$ atlas projects list
$ atlas auth logout
```

### Useful MongoDB commands:

```bash
$ show dbs
$ show collections
$ db.find()
$ db.findOne()
$ db.help()
$ db.hello()
```
