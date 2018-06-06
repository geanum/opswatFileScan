
const fs = require('fs');
const crypto = require('crypto');
const OpswatAPI = require('./opswat');

const main = () => {

  const targetFile = process.argv[2];

  if (!targetFile) {
    console.log("Please specify a target file when running the program. (ex. 'node scan.js targetFile.test'");
    return;
  }

  if (!fs.existsSync(targetFile)) {
    console.log("The file you selected does not exist! (Your input: '" + targetFile + "')");
    return;
  }

  return hashFile(targetFile)

  .then((hash) => OpswatAPI.getHashLookup(hash))

  .then((response) => {
    if (response.data_id) // if results already available
      return response;
    else { // else scan file
      return scanFile(targetFile); 
    }
  })

  .then((results) => printResults(targetFile, results))

  .catch((error) => console.log(error));
}


const hashFile = (targetFile) => {
  return new Promise((resolve, reject) => {
    let file = fs.createReadStream(__dirname + '/' + targetFile);
    file.on('error', err => reject(err));

    let hash = crypto.createHash('sha256').setEncoding('hex');
    hash.on('finish', () => resolve(hash.read()));

    file.pipe(hash);
  });
}


const scanFile = (targetFile) => {
  return new Promise((resolve, reject) => {
    let file = fs.createReadStream(__dirname + '/' + targetFile);

    OpswatAPI.postFileUpload(file)
    .then((response) => {
      const dataId = response.data_id;

      return resolve(pullResults(dataId));
    })
  })
}


const pullResults = (dataId) => {
  return new Promise((resolve, reject) => {
    OpswatAPI.getScanReport(dataId)
    .then((response) => {
      if (response.file_id)  // if scans completed
        return resolve(response);
      else // else keep trying until scans completed
        return resolve(pullResults(dataId));
    })
  })
}


const printResults = (file, results) => {
  console.log('File Name: ' + file);
  console.log('Overall Status: ' + results.scan_results.scan_all_result_a);

  const scans = results.scan_results.scan_details;
  for (var i in scans) {
    console.log(''); // newline
    console.log('Engine: ' + i);
    console.log('Threat Found: ' + (scans[i].threat_found? scan[i] : 'None'));
    console.log('Scan Result: ' + scans[i].scan_result_i);
    console.log('Scan Time: ' + scans[i].scan_time);
    console.log('def_time: ' + scans[i].def_time);
  }

  console.log('');
  console.log('END');
}

main();