const { pipeline } = require("stream/promises");
const unzipper = require("yauzl-promise");
const fs = require("fs");
const PNG = require("pngjs").PNG;
const path = require("path");

/**
 * Description: Decompresses the zip file from the given pathIn and writes to the given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {Promise}
 */
const unzip = async (pathIn, pathOut) => {
  try {
    console.log("Attempting to open zip file:", pathIn); // Log the zip file path
    const zip = await unzipper.open(pathIn);
    console.log("Zip file opened successfully:", pathIn); // Log success
    for await (const entry of zip) {
      try {
        if (entry.filename && !entry.filename.endsWith('/')) {
          console.log("Entry filename:", entry.filename); // Log the filename to check
          const entryStream = await entry.openReadStream(); // Open the stream for the entry
          console.log("Entry stream:", entryStream); // Log the entry stream to check
          if (!entryStream) {
            console.error("Entry stream is undefined.");
            continue; // Skip to the next entry
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

module.exports = {
  unzip,
};

/**
 * Description: Reads all the PNG files from the given directory and returns a Promise containing an array of each PNG file path
 *
 * @param {string} dirPath
 * @return {Promise<Array<string>>}
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
 * Description: Reads a PNG file from the given pathIn, converts it to grayscale, and writes to the given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {Promise}
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
