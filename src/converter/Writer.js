const fs = require('fs-extra');
const shortid = require('shortid');
const path = require('path');
const moment = require('moment');

class Writer {
    constructor(pdfWriter, parser) {
        this.pdfWriter = pdfWriter;
        this.parser = parser;
    }

    async saveImagesAndSetPath(data, outputPath) {
        data.ArrayOfMessage.Message = await Promise.all(data.ArrayOfMessage.Message.map(async(msg) => {
            msg.Attachments = await Promise.all(msg.Attachments.MessageAttachment
                .filter(attachment => attachment.AttachmentContentType !== 'application/smil')
                .map(async (attachment) => {
                const data = attachment.AttachmentDataBase64String;
                    const type = attachment.AttachmentContentType;
                    if(type === 'text/plain') {
                        const text = new Buffer(data, 'base64').toString('utf8');
                        return { type, text };
                    } else {
                        const imagePath = path.join('images', `${shortid.generate()}.jpeg`);
                        await fs.outputFile(path.join(outputPath, imagePath), new Buffer(data, 'base64'));
                        return { type, text: imagePath};
                    }
                }));
            return msg;
        }));
        return data;
    }

    async write(dataAsJSON, format, outputPath) {
        console.log('Writing to file...');
        const today = moment().format('DD-MMM-YYYY_HH-mm');
        const filename = path.join(outputPath, `backup_${today}.${format}`);
        const [ contactsBackup, mmsBackup, smsBackup ] = dataAsJSON;

        mmsBackup.data = await this.saveImagesAndSetPath(mmsBackup.data, outputPath);
        console.log('Finished saving images');

        const data = this.parser.parse([ contactsBackup, mmsBackup, smsBackup ]);

        if(format === 'pdf') {
            await this.pdfWriter.write(outputPath, filename, data);
        } else {
            await fs.outputJson(filename, data);
        }
        console.log('Done writing');
    }
}

module.exports = Writer;