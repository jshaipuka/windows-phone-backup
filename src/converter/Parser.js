const R = require('ramda');
const moment = require('moment-timezone');
const { defaultTimezone, defaultTimeFormat, YOU, LENGTH_OF_NON_SPECIAL_CONTACT_NUMBER } = require('./constants');

const LDAPtoUnix = ldapTimestamp => ldapTimestamp/10000 - 11644473600000;

const sortByTime = R.sortBy(R.prop('LocalTimestamp'));

const groupByConversation = R.groupBy(message => message.Recepients !== YOU ? message.Recepients :  message.Sender);

const setContact = (contact, contacts) => {
    if(R.isNil(contact) || R.isEmpty(contact)) return YOU;
    if(contacts[contact]) return contacts[contact];

    const foundDuplicateContact = Object.keys(contacts)
            .filter(storedContact => storedContact.length > LENGTH_OF_NON_SPECIAL_CONTACT_NUMBER)
            .find(storedContact => storedContact.length > contact.length ? storedContact.endsWith(contact) : contact.endsWith(storedContact));

    if(foundDuplicateContact) {
        contacts[contact] = contacts[foundDuplicateContact];
        return contacts[contact];
    } 

    contacts[contact] = contact;
    return contact;
};
const toJSON = (data, contacts = {}) => {
    const convert = item => {
        item.Sender = setContact(item.Sender, contacts);
        item.Recepients = setContact(item.Recepients.string, contacts);
        item.LocalTimestamp = moment(LDAPtoUnix(item.LocalTimestamp)).tz(defaultTimezone).format(defaultTimeFormat);
        return item;
    };
    return data.map(convert);
};

class Parser {
    constructor() { }

    parse([ contactsBackup, mmsBackup, smsBackup ]) {
        const data = [ ...mmsBackup.data.ArrayOfMessage.Message, ...smsBackup.data.ArrayOfMessage.Message];
        const sorted = sortByTime(data);
        const converted = toJSON(sorted, contactsBackup.data);
        const grouped = groupByConversation(converted);
        return grouped;
    }
}

module.exports = Parser;