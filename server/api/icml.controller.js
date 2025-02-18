const { logger } = require('@coko/server')
const fs = require('fs-extra')
const path = require('path')
const { authenticate } = require('@coko/service-auth')
const { exec } = require('child_process')

const { uploadHandler } = require('./helpers')

const conversionHandler = async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).json({ msg: req.fileValidationError })
  }
  if (!req.file) {
    return res.status(400).json({ msg: 'HTML file is not included' })
  }
  const { path: filePath } = req.file
  const filename = path.basename(filePath)
  const deconstructedFilename = filename.split('.')
  const name = deconstructedFilename[0]
  const outputFile = `temp/${name}.icml`

  req.on('error', async err => {
    logger.error(err.message)
    return fs.remove(outputFile)
  })
  res.on('finish', async () => {
    logger.info(`removing file ${outputFile}`)
    await fs.remove(outputFile)
  })
  try {
    await new Promise((resolve, reject) => {
      exec(
        `pandoc -s ${filePath} -o ${outputFile}`,
        (error, stdout, stderr) => {
          if (error) {
            return reject(error)
          }
          return resolve(stdout || stderr)
        },
      )
    })

    if (!fs.existsSync(outputFile)) {
      return res.status(500).json({ msg: 'Error, file was not created' })
    }
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename=${name}.icml`,
    })

    fs.createReadStream(outputFile).pipe(res)
  } catch (e) {
    throw new Error(e)
  }
}

const htmlToICMLBackend = app => {
  app.post('/api/htmlToICML', authenticate, uploadHandler, conversionHandler)
}

module.exports = htmlToICMLBackend
