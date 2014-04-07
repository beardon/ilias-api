var soapClient = require('./soapClient');

function getClient(wsdl, callback) {
    return soapClient.getClient(wsdl, function (err, client) {
        if (err) {
            return callback(err);
        }
        return callback(null, client);
    })
}

function getUser(client, sid, userId, callback) {
    if (!!userId) {
        var parts = {
            sid: sid,
            user_id: userId
        };
        return client.getUser(parts, function (err, result) {
            if (err) {
                return soapClient.processSoapError(result.body, 'getUser', function (subErr, newErr) {
                    if (subErr) {
                        return callback(subErr);
                    }
                    return callback(newErr);
                });
            }
            var userData = result.user_data;
            delete userData.passwd; // no reason to return this
            return callback(null, userData);
        });
    } else {
        return callback(null);
    }
}

function login(client, clientName, username, password, method, callback) {
    method = method || 'ldap';
    var parts = {
        client: clientName,
        username: username,
        password: password
    };
    switch (method) {
        case 'db':
            return client.login(parts, function (err, result) {
                if (err) {
                    return soapClient.processSoapError(result.body, 'login', function (subErr, newErr) {
                        if (subErr) {
                            return callback(subErr);
                        }
                        return callback(newErr);
                    });
                }
                return callback(null, result.sid);
            });
        case 'ldap':
            return client.loginLDAP(parts, function (err, result) {
                if (err) {
                    return soapClient.processSoapError(result.body, 'loginLDAP', function (subErr, newErr) {
                        if (subErr) {
                            return callback(subErr);
                        }
                        return callback(newErr);
                    });
                }
                return callback(null, result.sid);
            });
        default:
            return callback(null);
    }
}

function lookupUser(client, sid, username, callback) {
    var parts = {
        sid: sid,
        user_name: username
    };
    return client.lookupUser(parts, function (err, result) {
        if (err) {
            return soapClient.processSoapError(result.body, 'lookupUser', function (subErr, newErr) {
                if (subErr) {
                    return callback(subErr);
                }
                if (newErr.code != 'ER_SOAP_REQUEST_CLIENT') {
                    return callback(newErr);
                } else {
                    return callback(null);
                }
            });
        }
        return callback(null, result.usr_id);
    });
}

module.exports = {
    getClient: getClient,
    getUser: getUser,
    login: login,
    lookupUser: lookupUser
};
