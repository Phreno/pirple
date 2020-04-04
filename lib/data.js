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
lib.read = (dir, file, cb) => {
  fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf8', (err, data) => {
    cb(err, data)
  })
}
// update the data
lib.update = (dir, file, data, cb) => {
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', (err, fd) => {
    if (!err && fd) {
      // convert data to a string
      const stringData = JSON.stringify(data)
      fs.truncate(fd, (err) => {
        if (err) {
          cb('Error truncating the file')
        } else {
          // write to file and close it
          fs.writeFile(fd, stringData, (err) => {
            if (err) {
              cb('Error writing to file')
            } else {
              fs.close(fd, (err) => {
                if (err) {
                  cb('Error closing file')
                } else {
                  cb()
                }
              })
            }
          })
        }
      })
    } else {
      cb('Could not create new file, it may already exist')
    }
  })
}
// delete a file
lib.delete = (dir, file, cb) => {
  fs.unlink(`${lib.baseDir}${dir}/file.json`, (err) => {
    if (err) {
      cb('Error deleting file')
    } else {
      cb()
    }
  })
}
// export the module
module.exports = lib