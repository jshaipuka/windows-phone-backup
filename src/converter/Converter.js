class Converter {
    constructor(reader, writer) {
        this.reader = reader;
        this.writer = writer;
    }

    async convert({ directory: inputPath, outputPath, format }) {
        const dataAsJSON = await this.reader.read(inputPath);
        return this.writer.write(dataAsJSON, format, outputPath);
    }
}

module.exports = Converter;