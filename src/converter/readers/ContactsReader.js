const vdataParser = require('vdata-parser');

const withoutTelephone = card => 'TEL' in card;

class ContactsReader {
    constructor() {}

    read(path) {
        const data = vdataParser.fromFileSync(path);

        const contacts = {};
        data.VCARD.filter(withoutTelephone).forEach(card => {
            contacts[card.TEL.value] = card.FN.trim();
        });
        return contacts;
    }
}

module.exports = ContactsReader;