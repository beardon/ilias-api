var webservice = require('./lib/webservice');

module.exports = {
    getClient: webservice.getClient,
    getUser: webservice.getUser,
    login: webservice.login,
    lookupUser: webservice.lookupUser
};
