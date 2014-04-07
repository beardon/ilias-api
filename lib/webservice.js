var Promise = require('bluebird');
var soapClient = require('./soapClient');

module.exports.getClient = function (wsdl) {
    return soapClient.getClient(wsdl);
};

module.exports.getUser = function (client, sid, userId) {
    if (!!userId) {
        var parts = {
            sid: sid,
            user_id: userId
        };
        return client.getUser(parts)
            .then(function (result) {
                var userData = result.user_data;
                delete userData.passwd; // no reason to return this
                return Promise.resolve(userData);
            })
            .error(function (err) {
                return soapClient.processSoapError(result.body, 'getUser', function (subErr, newErr) {
                    if (subErr) {
                        return Promise.reject(subErr);
                    }
                    return Promise.reject(newErr);
                });
            })
    } else {
        return Promise.resolve(null);
    }
};

module.exports.login = function (client, clientName, username, password, method) {
    method = method || 'ldap';
    var parts = {
        client: clientName,
        username: username,
        password: password
    };
    switch (method) {
        case 'db':
            return client.login(parts)
                .then(function (result) {
                    return Promise.resolve(result.sid);
                })
                .error(function (err) {
                    return soapClient.processSoapError(result.body, 'login', function (subErr, newErr) {
                        if (subErr) {
                            return Promise.reject(subErr);
                        }
                        return Promise.reject(newErr);
                    });
            });
        case 'ldap':
            return client.loginLDAP(parts)
                .then(function (result) {
                    return Promise.resolve(result.sid);
                })
                .error(function (err) {
                    return soapClient.processSoapError(result.body, 'loginLDAP', function (subErr, newErr) {
                        if (subErr) {
                            return Promise.reject(subErr);
                        }
                        return Promise.reject(newErr);
                    });
            });
        default:
            return Promise.resolve(null);
    }
};

module.exports.lookupUser = function (client, sid, username) {
    var parts = {
        sid: sid,
        user_name: username
    };
    return client.lookupUser(parts)
        .then(function (result) {
            return Promise.resolve(result.usr_id);
        })
        .error(function (err) {
            return soapClient.processSoapError(result.body, 'lookupUser', function (subErr, newErr) {
                if (subErr) {
                    return Promise.reject(subErr);
                }
                if (newErr.code != 'ER_SOAP_REQUEST_CLIENT') {
                    return Promise.reject(newErr);
                } else {
                    return Promise.reject(null);
                }
            });
        })
};
