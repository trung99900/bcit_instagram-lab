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
      // Define paths
        const zipFilePath = path.join(__dirname, "myfile.zip");
        const pathUnzipped = path.join(__dirname, "unzipped");
        const pathProcessed = path.join(__dirname, "grayscaled");
  
        // Unzip the file
        await IOhandler.unzip(zipFilePath, pathUnzipped);
  
        // Read the directory to get PNG files
        const pngFiles = await IOhandler.readDir(pathUnzipped);
  
        // Convert each PNG image to grayscale
        for (const pngFile of pngFiles) {
            const filename = path.basename(pngFile);
            const outputPath = path.join(__dirname, "grayscaled", filename);
            await IOhandler.grayScale(fs.createReadStream(pngFile), outputPath);
        }
        } catch (err) {
            console.error("Error:", err);
        }
})();

