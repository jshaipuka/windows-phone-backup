const PdfPrinter = require('pdfmake/src/printer');
const fs = require('fs-extra');
const path = require('path');

const fonts = {
	Roboto: {
		normal: path.resolve(__dirname, '../../fonts/Roboto-Regular.ttf'),
		bold: path.resolve(__dirname, '../../fonts/Roboto-Medium.ttf'),
		italics: path.resolve(__dirname, '../../fonts/Roboto-Italic.ttf'),
		bolditalics: path.resolve(__dirname, '../../fonts/Roboto-MediumItalic.ttf')
	}
};

const docDefinition = {
	styles: {
		header: {
			fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 15],
            alignment: 'center'
        },
        time: {
            fontSize: 8,
            italics: true,
            alignment: 'right'
        },
        msg: {
            fillColor: '#eeeeee', 
            margin: [5, 4, 5, 4]
        },
        mms: {
            alignment: 'center',
            margin: [0, 10, 0, 15]
        },
        tableHeader: {
			bold: true,
			fontSize: 13,
			color: 'black'
		},
        alignment: 'justify'
	}
};

const countStats = (json) => {
    const countMessages = Object.keys(json).map(key => {
        const total = json[key].length;
        const received = json[key].filter(msg => msg.IsIncoming === 'true').length;
        const sent = total - received;
        return [
            key,
            { text: sent, alignment: 'center' },
            { text: received, alignment: 'center' },
            { text: total, alignment: 'center' }
        ];
    });

    const header = {
        text:  'Stats',
        style: 'header',
        pageBreak: 'before',
        tocItem: true
    };
    const stats = {
        table: {
            headerRows: 1,
            body: [
                [
                    {text: 'Conversation with', style: 'tableHeader'},
                    {text: 'Messages sent', style: 'tableHeader'},
                    {text: 'Messages received', style: 'tableHeader'},
                    {text: 'Messages in total', style: 'tableHeader'}
                ],
                ...countMessages
            ]
        },
        layout: 'headerLineOnly'
    };
    return [header, stats];
}

const toContent = (outputPath, json) => {
    const toc = {
        toc: {
            title: { text: 'INDEX', style: 'header' },
            numberStyle: { bold: true }
        }
    };

    const stats = countStats(json);

    const mainContent = Object.keys(json).map(key => {
        const header = {
            text:  'Conversation with ' + key,
            style: 'header',
            pageBreak: 'before',
            tocItem: true
        };
        const table = {
            table: {
                widths: ['45%', '10%', '45%'],
                body: []
            },
            layout: 'noBorders'
        };
    
        const columns = json[key].map(msg => {
            let attachments;
            if(Array.isArray(msg.Attachments) && msg.Attachments.length > 0) {
                attachments = msg.Attachments.map(attachment => {
                    if(attachment.type === 'image/jpeg') {
                        return {
                            image: path.resolve(outputPath, attachment.text),
                            width: 120,
                            style: 'mms'
                        };
                    }
                    return { text: attachment.text }
                });
            }
            
            const msgBody = { text: msg.Body + '\n' };
            const time = { text: msg.LocalTimestamp, style: 'time' };

            const contentColumn = attachments ? { stack: [ ...attachments, time], style: 'msg' } : { text: [msgBody, time], style: 'msg' };
    
            return msg.IsIncoming === 'true' ? [contentColumn, '', ''] : ['', '', contentColumn];
        });
    
        table.table.body = columns;
    
        return [header, table]
    });
    return [toc, ...stats, ...mainContent];
}

class PDFWriter {
    constructor() {
        this.printer = new PdfPrinter(fonts);
    }

    async write(outputPath, filename, json) {
        const content = toContent(outputPath, json);
        docDefinition.content = content;

        const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(fs.createWriteStream(filename));
        pdfDoc.end();
    }
}

module.exports = PDFWriter;