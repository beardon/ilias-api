var Promise = require('bluebird');
var soapClient = require('./soapClient');

var e = module.exports;

e.getClient = function (wsdl) {
    return soapClient.getClient(wsdl)
        .then(function (client) {
            return Promise.promisifyAll(client);
        })
};

e.getObjectsByTitle = function (client, sid, title, userId) {
    var parts = {
        sid: sid,
        title: title,
        userId: userId
    };
    return client.getObjectsByTitleAsync(parts)
        .then(function (result) {
            return result;
        })
        .error(function (err) {
            return soapClient.processSoapError(err.cause.body, 'getObjectsByTitle')
                .then(function (soapErr) {
                    return Promise.reject(soapErr);
                })
                .error(function (parseErr) {
                    return Promise.reject(parseErr);
                })
        });
};

e.getUser = function (client, sid, userId) {
    if (!!userId) {
        var parts = {
            sid: sid,
            user_id: userId
        };
        return client.getUserAsync(parts)
            .then(function (result) {
                var userData = result[0].user_data;
                delete userData.passwd; // no reason to return this
                return userData;
            })
            .error(function (err) {
                return soapClient.processSoapError(err.cause.body, 'getUser')
                    .then(function (soapErr) {
                        return Promise.reject(soapErr);
                    })
                    .error(function (parseErr) {
                        return Promise.reject(parseErr);
                    })
            });
    } else {
        return Promise.resolve(null);
    }
};

e.getXmlTree = function (client, sid, refId, types, userId) {
    var parts = {
        sid: sid,
        ref_id: refId,
        types: types,
        user_id: userId
    };
    return client.getXMLTreeAsync(parts)
        .then(function (result) {
            return result[0].object_xml;
        })
        .error(function (err) {
            return soapClient.processSoapError(err.cause.body, 'getXmlTree')
                .then(function (soapErr) {
                    return Promise.reject(soapErr);
                })
                .error(function (parseErr) {
                    return Promise.reject(parseErr);
                })
        });
};

e.login = function (client, clientName, username, password, method) {
    method = method || 'ldap';
    var parts = {
        client: clientName,
        username: username,
        password: password
    };
    switch (method) {
        case 'db':
            return client.loginAsync(parts)
                .then(function (result) {
                    return result[0].sid;
                })
                .error(function (err) {
                    return soapClient.processSoapError(result.body, 'login')
                        .then(function (soapErr) {
                            return Promise.reject(soapErr);
                        })
                        .error(function (parseErr) {
                            return Promise.reject(parseErr);
                        })
                });
        case 'ldap':
            return client.loginLDAPAsync(parts)
                .then(function (result) {
                    return result.sid;
                })
                .error(function (err) {
                    return soapClient.processSoapError(err.cause.body, 'loginLDAP')
                        .then(function (soapErr) {
                            return Promise.reject(soapErr);
                        })
                        .error(function (parseErr) {
                            return Promise.reject(parseErr);
                        })
                });
        default:
            return Promise.resolve(null);
    }
};

e.lookupUser = function (client, sid, username) {
    var parts = {
        sid: sid,
        user_name: username
    };
    return client.lookupUserAsync(parts)
        .then(function (result) {
            return result[0].usr_id;
        })
        .error(function (err) {
            return soapClient.processSoapError(err.cause.body, 'lookupUser')
                .then(function (soapErr) {
                    if (soapErr.code != 'ER_SOAP_REQUEST_CLIENT') {
                        return Promise.reject(soapErr);
                    }
                    return Promise.resolve(null);
                })
                .error(function (parseErr) {
                    return Promise.reject(parseErr);
                })
        });
};

e.logout = function (client, sid) {
    var parts = {
        sid: sid
    };
    return client.logoutAsync(parts)
        .then(function (result) {
            return result[0].success;
        })
        .error(function (err) {
            return soapClient.processSoapError(err.cause.body, 'logout')
                .then(function (soapErr) {
                    return Promise.reject(soapErr);
                })
                .error(function (parseErr) {
                    return Promise.reject(parseErr);
                })
        });
};
