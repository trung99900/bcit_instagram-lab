const path = require("path");
const fs = require("fs");
/*
 * Project: Milestone 1
 * File Name: main.js
 * Description:
 *
 * Created Date:
 * Author:
 *
 */

const IOhandler = require("./IOhandler");
(async () => {
    try {
        const zipFilePath = path.join(__dirname, "myfile.zip");
        const pathUnzipped = path.join(__dirname, "unzipped");
        const pathProcessed = path.join(__dirname, "grayscaled");
  
        await IOhandler.unzip(zipFilePath, pathUnzipped);
  
        const pngFiles = await IOhandler.readDir(pathUnzipped);
  
        for (const pngFile of pngFiles) {
            const filename = path.basename(pngFile);
            const outputPath = path.join(__dirname, "grayscaled", filename);
            await IOhandler.grayScale(pngFile, outputPath);
        }
    } catch (err) {
        console.error("Error:", err);
    }
})();

