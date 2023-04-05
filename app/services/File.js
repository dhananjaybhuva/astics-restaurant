/****************************
 FILE HANDLING OPERATIONS
 ****************************/
const _ = require('lodash');
let path = require('path');
const mv = require('mv');
const configs = require('../../configs/configs');

class File {
  constructor(file, location) {
    this.file = file;
    this.location = location;
  }

  /** Method to store any file as it is */
  storeImage(data) {
    return new Promise((resolve, reject) => {
      if (_.isEmpty(this.file.file)) {
        reject('Please send file.');
      }

      let fileName = this.file.file[0].originalFilename.split('.');
      let ext = _.last(fileName);
      let imagePath = data && data.imagePath ? data.imagePath : configs.localImagePath;
      let name = `${ext}_${Date.now().toString()}.${ext}`;
      let filePath = imagePath + name;
      let fileObject = { fileName: name, filePath };
      mv(this.file.file[0].path, appRoot + filePath, { mkdirp: true }, function (err) {
        if (err) {
          reject(err);
        }
        if (!err) {
          resolve(fileObject);
        }
      });
    });
  }

}

module.exports = File;
