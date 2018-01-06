
# WindowsPhone backup files to pdf or json

Based on this repository:
https://github.com/matteocontrini/sms-wp-to-android

After you created the backup in xml, port it to your computer and run:

```
cd <PROJECT_DIRECTORY>
npm i
node ./src/index.js -d <PATH_TO_BACKUP_FOLDER> -f pdf -o<PATH_TO_OUTPUT_FOLDER>
```

This will generate a pdf to the desired output folder.
