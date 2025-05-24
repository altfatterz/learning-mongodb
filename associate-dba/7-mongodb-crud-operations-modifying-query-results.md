## 7 - MongoDB CRUD Operations: Modifying Query Results

### Sorting and limiting query results

`cursor.sort()` -> https://www.mongodb.com/docs/manual/reference/method/cursor.sort/

```bash
db.collection.find(<query>).sort(<sort>)

# Return data on all music companies, sorted alphabetically from A to Z.
db.companies.find({ category_code: "music" }).sort({ name: 1 });

# Return data on all music companies, sorted alphabetically from A to Z. Ensure consistent sort order
db.companies.find({ category_code: "music" }).sort({ name: 1, _id: 1 });
```

`cursor.limit()` -> https://www.mongodb.com/docs/manual/reference/method/cursor.limit/

```bash
db.companies.find(<query>).limit(<number>)

# Return the three music companies with the highest number of employees. Ensure consistent sort order.
db.companies
  .find({ category_code: "music" })
  .sort({ number_of_employees: -1, _id: 1 })
  .limit(3);
```

### Returning specific data from a query in MongoDB

`projection` -> https://www.mongodb.com/docs/manual/tutorial/project-fields-from-query-results/
`project restrictions` -> https://www.mongodb.com/docs/manual/reference/limits/

- inclusion & exclusion statement can't be combined in the projections (_id field exception)
- you can also use subfields in the projections but put into quotes

```bash
db.collection.find( <query>, <projection> )

# include a field, the _id field is included by default
db.collection.find( <query>, { <field> : 1 })

# Return all restaurant inspections - business name, result, and _id fields only
db.inspections.find(
  { sector: "Restaurant - 818" },
  { business_name: 1, result: 1 }
)  

# exclude a field
db.collection.find(query, { <field> : 0, <field>: 0 })

# Return all inspections with result of "Pass" or "Warning" - exclude date and zip code
db.inspections.find(
  { result: { $in: ["Pass", "Warning"] } },
  { date: 0, "address.zip": 0 }
)  
  
# Return all restaurant inspections - business name and result fields only
db.inspections.find(
  { sector: "Restaurant - 818" },
  { business_name: 1, result: 1, _id: 0 }
)  
```

### Counting documents in a MongoDB collection

`countDocuments()` -> https://www.mongodb.com/docs/manual/reference/method/db.collection.countDocuments/

- with no argument counts all documents

```bash
 
# options is optional to specify the counting behaviour
db.collection.countDocuments( <query>, <options> )

# Count number of docs in trip collection
db.trips.countDocuments()
# Count number of trips over 120 minutes by subscribers
db.trips.countDocuments({ tripduration: { $gt: 120 }, usertype: "Subscriber" })
```