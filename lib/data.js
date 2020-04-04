const fs = require('fs')
const path = require('path')
// container for the module
const lib = {}
// base directory of data
lib.baseDir = path.join(__dirname, '/../.data/')
// create a new file with data
lib.create = (dir, file, data, cb) => {
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (err, fd) => {
    if (!err && fd) {
      // convert data to a string
      const stringData = JSON.stringify(data)
      // write to file and close it
      fs.writeFile(fd, stringData, (err) => {
        if (err) {
          cb('Error writing to new file')
        } else {
          fs.close(fd, (err) => {
            if (err) {
              cb('Error closing new file')
            } else {
              cb()
            }
          })
        }
      })
    } else {
      cb('Could not create new file, it may already exist')
    }
  })
}
// read data from a file
// export the module
module.exports = lib