## 2 - MongoDB Data Modeling Intro

- A `good data model` can https://www.mongodb.com/docs/manual/data-modeling/
    - make it easier to manage data
    - make queries more efficient
    - use less memory and CPU
    - reduce costs

- `General principle`: data that is accessed together should be stored together https://www.mongodb.com/docs/manual/data-modeling/design-antipatterns/reduce-lookup-operations/

- MongoDB has a "schema flexible" approach to data https://www.mongodb.com/docs/manual/data-modeling/schema-design-process/

- Schema Design: https://www.mongodb.com/docs/manual/data-modeling/schema-design-process/

- Relationship types: https://www.mongodb.com/docs/manual/applications/data-models-relationships/
  - one-to-one 
    - `embedding`: can modelled in a single document
  - one-to-many
    - `embedding`: can modelled in a single document, ex: casts of a movie 
  - many-to-many
    - `referencing` - linking it with a reference

 `Embedding`: https://www.mongodb.com/resources/products/fundamentals/embedded-mongodb
    - One-To-One: https://www.mongodb.com/docs/manual/tutorial/model-embedded-one-to-one-relationships-between-documents/
    - One-To-Many: https://www.mongodb.com/docs/manual/tutorial/model-embedded-one-to-many-relationships-between-documents/
    - avoids application joins
    - provides better performance for read operations
    - allows developers to update related data to a single write operation
    - warning: 
        - can create large documents overtime (ex: comments related to a blog post)
            -> needs more memory and adds latency for read
            -> large documents have to be read in memory in full -> slow performance for end users
        - unbounded documents may exceed the BSON document threshold of 16 MB
 
`Referencing`:
    - store data in separate documents
    - save the `_id` field of one document in another document as a link between the two
    - https://www.mongodb.com/docs/manual/data-modeling/#references
    - https://www.mongodb.com/docs/manual/tutorial/model-referenced-one-to-many-relationships-between-documents/
    - no duplication of data -> smaller documents
    - warning:
        - querying from multiple documents costs extra resources and impacts read performance

- Optimum efficiency of
  - query result times
  - memory usage
  - CPU usage
  - storage

- Common schema anti-patterns
  - https://www.mongodb.com/blog/post/performance-best-practices-mongodb-data-modeling-and-memory-sizing
  - https://www.mongodb.com/docs/manual/core/data-model-operations/
    - massive arrays
    - massive number of collections
    - bloated documents
    - unnecessary indexes
    - queries without indexes
    - data that's accessed together, but stored in different collections

- MongoDB Atlas https://www.mongodb.com/docs/manual/data-modeling/design-antipatterns/
  - `Data Explorer` 
    - available in free tier, `Collections` tab
    - shows schema anti patterns
    - collection and index stats for each collection
  - `Performance Advisor` 
    - not available in free tier (M10 tier and higher)
    - recommends schema improvements
    - analyzes the most active collections
    