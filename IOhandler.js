/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date:
 * Author:
 *
 */

const { pipeline } = require("stream/promises");
const unzipper = require("yauzl-promise");
const fs = require("fs");
const PNG = require("pngjs").PNG;
const path = require("path");

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */

const unzip = async (pathIn, pathOut) => {
  try {
    console.log("Attempting to open zip file:", pathIn);
    const zip = await unzipper.open(pathIn);
    console.log("Zip file opened successfully:", pathIn);
    for await (const entry of zip) {
      try {
        if (entry.filename && !entry.filename.endsWith('/')) {
          console.log("Entry filename:", entry.filename);
          const entryStream = await entry.openReadStream();
          console.log("Entry stream:", entryStream);
          if (!entryStream) {
            console.error("Entry stream is undefined.");
            continue;
          }
          const fileName = path.basename(entry.filename);
          const destinationPath = path.join(pathOut, fileName);
          await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });
          await pipeline(entryStream, fs.createWriteStream(destinationPath));
        }
      } catch (err) {
        console.error("Error processing entry:", err);
      }
    }
    console.log("Extraction operation complete");
  } catch (err) {
    console.error("Error extracting zip file:", err);
  }
};

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = async (dir) => {
  try {
    const files = await fs.promises.readdir(dir);
    const pngFiles = files.filter((file) => file.toLowerCase().endsWith('.png'));
    return pngFiles.map((file) => path.join(dir, file));
  } catch (err) {
    console.error("Error reading directory:", err);
    return [];
  }
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const grayScale = async (pathIn, pathOut) => {
  try {
    const data = await fs.promises.readFile(pathIn);
    const png = PNG.sync.read(data);
    for (let y = 0; y < png.height; y++) {
      for (let x = 0; x < png.width; x++) {
        const idx = (png.width * y + x) << 2;
        const avg = (png.data[idx] + png.data[idx + 1] + png.data[idx + 2]) / 3;
        png.data[idx] = avg;
        png.data[idx + 1] = avg;
        png.data[idx + 2] = avg;
      }
    }
    await fs.promises.writeFile(pathOut, PNG.sync.write(png));
    console.log(`Grayscale conversion complete for ${path.basename(pathIn)}`);
  } catch (err) {
    console.error("Error applying grayscale filter:", err);
  }
};

module.exports = {
  unzip,
  readDir,
  grayScale,
};
