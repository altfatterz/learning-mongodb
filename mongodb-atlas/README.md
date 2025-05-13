
### MongoDB Atlas CLI

```bash
brew install mongodb-atlas-cli
atlascli version: 1.42.2
git version:
Go version: go1.24.2
   os: darwin
   arch: arm64
   compiler: gc

Setup Atlas:

```bash
atlas setup
```

```bash
atlas organization list
atlas projects list
  
atlas clusters list

ID                         NAME           MDB VER   STATE
6632717936bcd03edc728dc0   demo-cluster   8.0.9     IDLE
```


### Mongosh

```bash
brew install mongos
mongosh --version
2.5.1
mongosh "mongodb+srv://demo-cluster.odqjme8.mongodb.net/" --apiVersion 1 --username altfatterz
```

### MongoDB Compass (UI)

```bash
brew install mongodb-compass
```

```bash
show dbs;

blog                 40.00 KiB
demo                120.00 KiB
sample_airbnb        52.44 MiB
sample_analytics      9.54 MiB
sample_geospatial     1.27 MiB
sample_guides        40.00 KiB
sample_mflix        110.88 MiB
sample_restaurants    6.53 MiB
sample_supplies       1.04 MiB
sample_training      48.29 MiB
sample_weatherdata    2.59 MiB
admin               344.00 KiB
local                17.70 GiB


use sample_restaurants;
show collections;
db.restaurants.findOne();


{
  _id: ObjectId('5eb3d668b31de5d588f4298f'),
  address: {
    building: '15',
    coord: [ -73.98126069999999, 40.7547107 ],
    street: 'West   43 Street',
    zipcode: '10036'
  },
  borough: 'Manhattan',
  cuisine: 'American',
  grades: [
    { date: ISODate('2015-01-15T00:00:00.000Z'), grade: 'A', score: 7 },
    { date: ISODate('2014-07-07T00:00:00.000Z'), grade: 'A', score: 9 },
    {
      date: ISODate('2014-01-14T00:00:00.000Z'),
      grade: 'A',
      score: 13
    },
    {
      date: ISODate('2013-07-19T00:00:00.000Z'),
      grade: 'C',
      score: 29
    },
    {
      date: ISODate('2013-02-05T00:00:00.000Z'),
      grade: 'A',
      score: 12
    }
  ],
  name: 'The Princeton Club',
  restaurant_id: '40365361'
}
```