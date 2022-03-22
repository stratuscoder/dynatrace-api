// api/database.js
// used to store json data locally, uses key/value pairs
// stores in the app-db folder

const level = require('level');
const db = level('app-db');

const saveData = async (key, data) =>
{    
    if (gl_logging) console.info(Date.now() + " -> called saveData using key: "+key);
    if (gl_logging) console.info(Date.now() + " -> called saveData storing data: "+data);

    return await db.put(key, data, function (err) {
        if (err) {
            console.error(Date.now() + " -> error: "+err);
        } else {
            if (gl_logging) console.info(Date.now() + " -> saved: "+key+" data");
            return data;
        }
    });       
}

const getData = async (key) =>
{    
    if (gl_logging) console.info(Date.now() + " -> called getData for "+key);
    return await db.get(key, function (err, value) {
        if (err) {
            console.error(Date.now() + " -> error: "+err);
            return err;
        } else {
            if (gl_logging) console.info(Date.now() + " -> retrieved key: "+key+" with value of "+JSON.stringify(value));
            return value;
        }
    });
}    

module.exports = { saveData, getData };
