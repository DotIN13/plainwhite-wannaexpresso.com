import fs from "fs"

module.exports = async (req, res) => {
    try {
        const testFolder = req.query.folder
        const filename = req.query?.filename
        let files = []
        if (filename) {
            fs.readdirSync(testFolder).forEach(file => {
                if (filename == file) files = fs.readFileSync(testFolder + file, (err, data) => data)
            })
        } else {
            fs.readdirSync(testFolder).forEach(file => files.push(file))
        }

        res.status(200).send(files)
    }
    catch (err) {
        res.status(500).send(err)
    }
}