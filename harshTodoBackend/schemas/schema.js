/* schema format
let schemaObject={
tableName:{query:'',description:''}
}
*/

/* view format 
let viewObject={
tableName:{query:"",description:''}
}
*/

/* schema format example
let schemaObject={
    newApp:{query:"create table newApp (id integer primary key, name varchar(255))",description:'creating the table newApp},
    newCall:{query:"create table newCall(id integer primary key, name varchar(255))", description:'creating the table newCall}
}
*/

/* view object format example
  let viewObject={
  combined_temp_test_view: {query: `CREATE VIEW combined_temp_test_view AS
                              SELECT 
                                  t1.id AS id_1, 
                                  t1.name AS name_1, 
                                  t2.id AS id_2, 
                                  t2.name AS name_2
                              FROM 
                                  temp_test_1 t1
                              JOIN 
                                  temp_test_2 t2 ON t1.id = t2.id;`,Description: "created a new view temp_test_view"}
  }
*/

//schema object for creating tables
let schemaObject = {};

//view object for creating view tables
let viewObject = {};

//normalize the table names to lowercase
function normalizeKeys(obj) {
  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.toLowerCase(),
        normalizeKeys(value)
      ])
    );
  }
  return obj;
}

// Normalize the schemaObject and viewObject
let normalizedSchemaObject = Object.fromEntries(
  Object.entries(schemaObject).map(([key, value]) => [
    key.toLowerCase(),
    normalizeKeys(value)
  ])
);

// Normalize the viewObject
let normalizedViewObject = Object.fromEntries(
  Object.entries(viewObject).map(([key, value]) => [
    key.toLowerCase(),
    normalizeKeys(value)
  ])
);

// Exporting both normalized objects
module.exports = { normalizedSchemaObject, normalizedViewObject };
