const fs = require('fs-extra');
const { folders, contactsExt, smsMmsExt } = require('./constants');

const flatten = ( total, value ) => total.concat(value);
const checkExtension = fileName => fileName.endsWith(contactsExt) || fileName.endsWith(smsMmsExt);
const folderExists = folderName => folders.indexOf(folderName) !== -1;

const filesPaths = async (folder) => {
    const files = await fs.readdir(folder.path);
    return files
        .filter(checkExtension)
        .map(filePath => ({
            type: folder.type,
            path: `${folder.path}/${filePath}`
        }));
};

class Reader {
    constructor(contactsReader, xmlReader) {
        this.contactsReader = contactsReader;
        this.xmlReader = xmlReader;
    }

    async read(path) {
        console.log(`Scanning "${path}" directory`);
    
        const foundFolders = (await fs.readdir(path))
            .filter(folderExists)
            .map(folder => ({
                type: folder,
                path: `${path}/${folder}`
            }));
    
        if (!foundFolders.length) {
            console.log(`Directory does not contain folders: "${folders}"`);
            return;
        }

        const filesToRead = (await Promise.all(foundFolders.map(filesPaths))).reduce(flatten, []);

        console.log(`Finished scanning "${path}" directory`);

        return filesToRead.map(file => {
            file.data = file.type === 'contactsBackup'? this.contactsReader.read(file.path) : this.xmlReader.read(file.path);
            return file;
        });
    }
}

module.exports = Reader;