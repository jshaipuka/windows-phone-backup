const fs = require('fs-extra');
const parser = require('xml2json');

class XMLReader {
    constructor() {}

    read(path) {
        const xml = fs.readFileSync(path, 'utf8');
        return JSON.parse(parser.toJson(xml));
    }
}


module.exports = XMLReader;