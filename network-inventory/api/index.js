
// api/index.js
// used to handle routes to /api

const apiRegister = require('./register');
const apiReporting = require('./reporting');

module.exports = function(app) {
    apiRegister("register", app);
    apiReporting("reporting", app);
    // add additional routes below after adding the require above.
}