var config = require('config');
var fmt = require('util').format;
var parseString = require('xml2js').parseString;
var soap = require('soap');

function getClient(wsdl, callback) {
    return soap.createClient(wsdl,
        function (err, client) {
            if (err) {
                return callback(err);
            }
            return callback(null, client);
        });
}

function processSoapError(xml, name, callback) {
    return parseString(xml, function (err, result) {
        if (err) {
            return callback(err);
        }
        var fault = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['SOAP-ENV:Fault'][0];
        var faultCode = fault.faultcode[0]._;
        var faultString = fault.faultstring[0]._;
        var iliasError = new Error(fmt('%s - SOAP Client: Failed with exception %s: %s', name, faultCode, faultString));
        iliasError.code = (faultCode == 'Client') ? 'ER_SOAP_REQUEST_CLIENT' : 'ER_SOAP_REQUEST_SERVER';
        return callback(null, iliasError);
    });
}

module.exports = {
    getClient: getClient,
    processSoapError: processSoapError
};
