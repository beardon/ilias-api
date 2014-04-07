var fmt = require('util').format;
var Promise = require('bluebird');
var parseString = Promise.promisify(require('xml2js').parseString);
var soap = Promise.promisifyAll(require('soap'));

module.exports.getClient = function (wsdl) {
    return soap.createClientAsync(wsdl);
};

module.exports.processSoapError = function (xml, name) {
    return parseString(xml)
        .then(function (result) {
            var fault = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['SOAP-ENV:Fault'][0];
            var faultCode = fault.faultcode[0]._;
            var faultString = fault.faultstring[0]._;
            var iliasError = new Error(fmt('%s - SOAP Client: Failed with exception %s: %s', name, faultCode, faultString));
            iliasError.code = (faultCode == 'Client') ? 'ER_SOAP_REQUEST_CLIENT' : 'ER_SOAP_REQUEST_SERVER';
            return Promise.resolve(iliasError);
        })
};
