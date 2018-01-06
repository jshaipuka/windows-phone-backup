#!/usr/bin/env node
const program = require('commander');
const Converter = require('./converter/Converter.js');
const Reader = require('./converter/Reader.js');
const Writer = require('./converter/Writer.js');
const PDFWriter = require('./converter/PDFWriter.js');
const Parser = require('./converter/Parser.js');
const ContactsReader = require('./converter/readers/ContactsReader.js');
const XMLReader = require('./converter/readers/XMLReader.js');

program
    .version('0.0.1')
    .option('-d, --directory [path]', 'Path to directory which contains 3 folders containing contact, mms and sms backup', './')
    .option('-f, --format <format>', 'Output format. Allowed formats: pdf, json', /^(pdf|json)$/i, 'json')
    .option('-o, --output-path [path]', 'Directory path where output will be placed', './')
    .parse(process.argv);

const parser = new Parser();
const contactsReader = new ContactsReader();
const xmlReader = new XMLReader();
const reader = new Reader(contactsReader, xmlReader);
const pdfWriter = new PDFWriter();
const writer = new Writer(pdfWriter, parser);

const converter = new Converter(reader, writer);
converter.convert(program);

console.log('Done!');