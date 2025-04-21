"use strict";
const versionControlDao = require("../dao/versionControlDao");
const path = require("path");
const configuration = require(path.join(process.cwd(), "./configuration"));
const {
  normalizedSchemaObject,
  normalizedViewObject
} = require("../schemas/schema.js");
const datasFile = require("../schemas/initial_data.js");
const log = require("../logger/loggerService.js");
const versions = require("../schemas/version.js");

async function migrateToLatestVersion() {
  //Version control needs the appName
  //so if appName is not exists it will not run the version migration
  if (!configuration?.dbInfo?.appName?.trim()) {
    log.logCompleteError(
      "version migration not allowed",
      "appName is not provided in config file"
    );
    return false;
  }

  //The below variable is a array where it is used to store the tableName that needs intial data
  let intial_data_to_be_inserted_into_table = [];
  try {
    // table schema execution function
    // this function will execute for every server restart
    // check version control table exists

    //here we are declare the application database version is 0
    let app_db_version = null;

    //check version control table exists
    const isVersionControlTableExists =
      await versionControlDao.checkTableExists("db_version_control");
    const tableExistsResult =
      isVersionControlTableExists?.recordset?.[0]?.TableExists;

    // if version control table exists
    if (tableExistsResult) {
      // getting app data from version control table
      const database_version =
        await versionControlDao.getVersionControlTableData();
      const databaseVersionResult = database_version?.rowsAffected?.[0];
      if (databaseVersionResult === 0) {
        //if no app version is exists in database
        // assign app database version is 0
        app_db_version = "0.0";
      } else {
        //if the app version is exists in database assign that version to the variable
        // assigning database version to app_db_version
        app_db_version = database_version.recordset[0].latestVersion;
      }
    } else {
      // version control table does not exist
      // creating version control table
      await versionControlDao.createVersionControlTable();
      // assigning database version as 0 as table now only created data does not exist
      app_db_version = "0.0";
    }

    //here getting both versions
    // first we will get version from version file and parse it into main and sub version
    //second we already have app database version will parse into main and sub version of app database version

    // this variable contains the latest version from the version file
    //if the latest version in version file is v9 then it will 9.0
    const query_version_from_version_file = getLatestValidVersion();

    //converting the version to array format
    const query_version_before_parsed_from_version_file =
      query_version_from_version_file.split(".");

    //here we have split the versions into main version and sub version/
    //for example from reading the schema file we find that the current version is 10.1
    //current main version=10 and current subversion=1
    const current_main_version = parseInt(
      query_version_before_parsed_from_version_file[0]
    );
    const current_sub_version = parseInt(
      query_version_before_parsed_from_version_file[1]
    );

    // latest database version
    let latest_db_version_before_parsing = app_db_version.split(".");

    //spliting the database version into main version and sub version
    //for example: database version is 9.8
    //split it into main version =9 and sub version=8
    let latest_db_main_version = parseInt(latest_db_version_before_parsing[0]);
    let latest_db_sub_version = parseInt(latest_db_version_before_parsing[1]);

    //from here we will check whether all the app table exists or not

    // schema object from the schema file
    const schemaObject = normalizedSchemaObject;

    const schemaLength = Object.keys(schemaObject).length;
    // At least one schema is required for table creation
    if (schemaLength > 0) {
      for (const tableName in schemaObject) {
        // Check table exists
        const normalizedTableName = tableName.toLowerCase();
        const isTableExists = await versionControlDao.checkTableExists(
          normalizedTableName
        );
        const tableExists = isTableExists?.recordset?.[0]?.TableExists;
        // if table does not exist
        if (!tableExists) {
          //here the table does not exist before creating the table check whether table has intial data
          //if the table has initial data push that table name into the array intial_data_to_be_inserted_into_table variable
          const dataObject = datasFile;
          const dataQuery = dataObject[tableName];
          if (dataQuery) {
            intial_data_to_be_inserted_into_table.push(normalizedTableName);
          }
          // check if schema exists or not
          const tableSchemaObject = schemaObject[normalizedTableName];
          if (
            tableSchemaObject?.query?.trim() &&
            tableSchemaObject?.description?.trim()
          ) {
            const tableSchemaQuery = tableSchemaObject.query;

            //check inside the schema object the table create query exists or not
            if (tableSchemaQuery) {
              // schema exists execute schema query
              await versionControlDao.QueryExecution(tableSchemaQuery);

              //contains the queries of missed schema updation
              //after creating the table apply the missed schema updation
              const queriesToExecute = applySchemaUpdates(
                latest_db_main_version,
                latest_db_sub_version,
                current_main_version,
                current_sub_version,
                normalizedTableName
              );
              if (queriesToExecute.length > 0) {
                for (const query of queriesToExecute) {
                  await versionControlDao.QueryExecution(query);
                }
              }
            } else {
              throw new Error(
                `Table ${normalizedTableName} does not have query for table creation`
              );
            }
          } else {
            throw new Error(
              `Table ${normalizedTableName} does not have valid format`
            );
          }
        }
      }
    } else {
      log.logCompleteError(
        "NoSchemaExists",
        `the schema file doesn't  have a single table schema`
      );
    }
    //untill here it is table exist check and schema execution

    //Check all the views exists if not create the views
    const viewObject = normalizedViewObject;

    const viewObjectLength = Object.keys(viewObject).length;

    if (viewObjectLength) {
      for (const viewName in viewObject) {
        const isViewExists = await versionControlDao.checkViewExists(viewName);

        const viewExists = isViewExists?.recordset?.[0]?.ViewExists;
        //if view does not exist
        if (!viewExists) {
          //getting the query of the view
          const viewSchemaObject = viewObject[viewName];
          if (
            viewSchemaObject?.query?.trim() &&
            viewSchemaObject?.description?.trim()
          ) {
            const viewSchemaQuery = viewSchemaObject.query;
            if (viewSchemaQuery) {
              // view schema exists execute  query
              await versionControlDao.QueryExecution(viewSchemaQuery);

              //apply the missed schema upadtion of the view
              const queriesToExecute = applySchemaUpdates(
                latest_db_main_version,
                latest_db_sub_version,
                current_main_version,
                current_sub_version,
                viewName
              );
              if (queriesToExecute.length > 0) {
                for (const query of queriesToExecute) {
                  await versionControlDao.QueryExecution(query);
                }
              }
            } else {
              throw new Error(
                `View table ${viewName} does not have query to execute`
              );
            }
          } else {
            throw new Error(
              `View table ${viewName} does not have valid format`
            );
          }
        }
      }
    }

    //untill here above we have checked all the tables and view exists

    //here in migration function we will compare both the current version and database version
    //if there is any new version we will execute that version and update the version in the database
    await compareAndMigrate();

    //after migration we will insert all initial data of the tables from the array intial_data_to_be_inserted_into_table
    await apply_All_the_Initial_Data_of_tables();

    // comparing both versions for updation
    async function compareAndMigrate() {
      if (
        current_main_version > latest_db_main_version ||
        (current_main_version === latest_db_main_version &&
          current_sub_version > latest_db_sub_version)
      ) {
        // getting versions to migrate
        let versionsToApply = getVersionsToApply(
          latest_db_main_version,
          latest_db_sub_version + 1,
          current_main_version,
          current_sub_version
        );

        // migration happens here
        for (let version of versionsToApply) {
          if (version.queries.length > 0) {
            for (let versionObject of version.queries) {
              // Check if each object has a valid query and description and tableName
              if (
                versionObject?.query?.trim() &&
                versionObject?.tableName?.trim() &&
                versionObject?.description?.trim()
              ) {
                await versionControlDao.QueryExecution(versionObject.query);

                if (current_main_version > 0 && latest_db_main_version === 0) {
                  // insert the app data only at the time of first initialization
                  // executed only once

                  await versionControlDao.insertInitialProductData(
                    versionObject.version
                  );
                  let latest_db_version_before_parsed = await getDbVersion();
                  latest_db_main_version = parseInt(
                    latest_db_version_before_parsed[0]
                  );
                  latest_db_sub_version = parseInt(
                    latest_db_version_before_parsed[1]
                  );
                }
                // updating the version in db
                await versionControlDao.updateProductVersionInDb(
                  versionObject.version
                ); // Added await
              } else {
                throw new Error(
                  `version ${versionObject.version} does not have valid version format`
                );
              }
            }
          }
        }
      }
    }
    function removeTableFromArray(tableName) {
      // Function remove the table name from the array
      const index = intial_data_to_be_inserted_into_table.indexOf(tableName);

      if (index !== -1) {
        intial_data_to_be_inserted_into_table.splice(index, 1);
      }

      return intial_data_to_be_inserted_into_table; // Return the modified array
    }

    async function apply_All_the_Initial_Data_of_tables() {
      // Inserting all the initial data from the array intial_data_to_be_inserted_into_table
      // Create a copy of the array to iterate through
      const tableNames = [...intial_data_to_be_inserted_into_table];
      for (const tableName of tableNames) {
        const dataObject = datasFile;
        const dataQuery = dataObject[tableName];

        // if the data query is exists execute the query
        if (dataQuery) {
          await versionControlDao.QueryExecution(dataQuery);
          //after inserting the data remove the table name from the array
          removeTableFromArray(tableName);
        }
      }
    }
    //function returns the checks and return valid version number
    //incase of invalid version raise a error
    function getLatestValidVersion() {
      Object.keys(versions).forEach((versionKey) => {
        const match = versionKey.match(/^[vV](\d+)$/);
        if (!match) {
          // If the version key doesn't match the required format like description,query and tableName throw an error
          throw new Error(`Invalid version format: ${versionKey}`);
        }

        const version = versions[versionKey];

        // Check if version is an array and has at least one object
        if (!Array.isArray(version) || version.length === 0) {
          throw new Error(`Invalid version data: ${versionKey}`);
        }

        // Check if all objects within the version have valid query, description, and tableName
        const isValid = version.some(
          (item) =>
            item?.query?.trim() &&
            item?.description?.trim() &&
            item?.tableName?.trim()
        );

        if (!isValid) {
          throw new Error(`Invalid version contents: ${versionKey}`);
        }
      });

      // Filter versions to find only valid ones after validation
      const validVersions = Object.keys(versions).filter((versionKey) => {
        const match = versionKey.match(/^[vV](\d+)$/);
        if (match) {
          const version = versions[versionKey];
          return Array.isArray(version) && version.length > 0;
        }
        return false;
      });

      // Find the maximum version number from the valid versions
      if (validVersions.length > 0) {
        const latestVersionKey = Math.max(
          ...validVersions.map((key) => parseInt(key.slice(1)))
        );

        const latestVersionKeyString = `v${latestVersionKey}`.toLowerCase();
        const latestVersion =
          versions[latestVersionKeyString] || versions[`V${latestVersionKey}`];

        // Find the latest subversion by using the index
        const latestSubVersion = `${latestVersionKey}.${
          latestVersion.length - 1
        }`;
        return latestSubVersion;
      }

      // Default to "0.0" if no valid versions
      return "0.0";
    }
    return true;
  } catch (error) {
    log.logCompleteError("migration to latest version", error);
    return false;
  }

  function applySchemaUpdates(
    latest_db_main_version,
    latest_db_sub_version,
    current_main_version,
    current_sub_version,
    tableName
  ) {
    // Parse the latest query version into main and sub versions
    const [latestMainVersion, latestSubVersion] = [
      current_main_version,
      current_sub_version
    ];

    const queriesToExecute = [];

    // Loop through all versions
    for (const versionKey in versions) {
      const mainVersion = parseInt(versionKey.replace("v", "")); // Extract main version number
      const versionEntries = versions[versionKey]; // Array of update objects for this version

      // Check if the latest_query_version and latest_db_version match
      if (
        latestMainVersion === latest_db_main_version &&
        latestSubVersion === latest_db_sub_version
      ) {
        // If the query version and DB version are the same, apply all versions related to the table
        versionEntries.forEach((updateObject) => {
          if (
            updateObject.tableName.toLowerCase() === tableName.toLowerCase()
          ) {
            queriesToExecute.push(updateObject.query);
          }
        });
      }
      // If latest_query_version > database_version, apply updates up to the latest query version
      else if (
        latestMainVersion > latest_db_main_version ||
        (latestMainVersion === latest_db_main_version &&
          latestSubVersion > latest_db_sub_version)
      ) {
        // If the current version is less than or equal to the database version, apply updates
        if (mainVersion <= latest_db_main_version) {
          versionEntries.forEach((updateObject, index) => {
            if (
              mainVersion === latest_db_main_version &&
              index <= latest_db_sub_version
            ) {
              // Apply the updates only if they belong to the same table
              if (
                updateObject.tableName.toLowerCase() === tableName.toLowerCase()
              ) {
                queriesToExecute.push(updateObject.query);
              }
            } else if (mainVersion < latest_db_main_version) {
              if (
                updateObject.tableName.toLowerCase() === tableName.toLowerCase()
              ) {
                queriesToExecute.push(updateObject.query);
              }
            }
          });
        }
      }
    }
    return queriesToExecute;
  }
}

async function getDbVersion() {
  const db_version = await versionControlDao.getVersionControlTableData();
  if (db_version) {
    const db_version_result = db_version?.recordset[0]?.latestVersion;
    const parsed_db_version_result = parseFloat(db_version_result);
    return parsed_db_version_result;
  }
  return null;
}

//function return the versions for migration
function getVersionsToApply(
  start_main_version,
  start_sub_version,
  end_main_version,
  end_sub_version
) {
  const versionsToApply = [];

  for (let versionKey in versions) {
    //getting version alone from the versions Eg:v8 -> 8 and converting to Integer
    const versionNumber = parseInt(versionKey.slice(1));

    // checking only main versions within the range
    if (
      versionNumber >= start_main_version &&
      versionNumber <= end_main_version
    ) {
      //version entries changes the versions format
      //Including the sub Version
      //Ex:v1:[{query:'',description:'',tableName:''}]
      // versionEntries=[
      // {query:'',description:'',tableName:'',version:1.0},
      //{query:'',description:'',tableName:'',version:1.1}
      //]
      const versionEntries = versions[versionKey].map((entry, index) => {
        const subVersion = `${versionNumber}.${index}`;
        return {
          ...entry,
          version: subVersion
        };
      });

      //versionInRange consist what are the versions in range
      //for eg: the Start verison is 2.3 and end version is 3.4
      //It has verison version as 2.4,2.5 and 3.0,3.1,3.2,3.3
      const versionsInRange = versionEntries.filter((entry) => {
        const versionSubIndex = parseInt(entry.version.split(".")[1]);
        //checking only the main versions
        if (
          versionNumber === start_main_version &&
          versionNumber === end_main_version
        ) {
          return (
            versionSubIndex >= start_sub_version &&
            versionSubIndex <= end_sub_version
          );
        }
        //reutrning versions within the range of from start_sub_version to end_sub_version
        //checking start sub version
        if (versionNumber === start_main_version) {
          return versionSubIndex >= start_sub_version;
        }
        //checking end sub version
        if (versionNumber === end_main_version) {
          return versionSubIndex <= end_sub_version;
        }

        return (
          versionNumber > start_main_version && versionNumber < end_main_version
        );
      });

      if (versionsInRange.length > 0) {
        versionsToApply.push({
          versionNumber: versionNumber,
          queries: versionsInRange
        });
      }
    }
  }
  //sort the versions based on the version order in versionsToApply
  versionsToApply.forEach((entry) => {
    entry.queries.sort((a, b) => {
      const versionA = a.version.split(".").map(Number);
      const versionB = b.version.split(".").map(Number);
      return versionA[0] === versionB[0] //if the both the version are same for Ex: v1===v1 then it will sort with subversion v1.0===v1.1
        ? versionA[1] - versionB[1]
        : versionA[0] - versionB[0];
    });
  });

  return versionsToApply;
}

module.exports.migrateToLatestVersion = migrateToLatestVersion;
