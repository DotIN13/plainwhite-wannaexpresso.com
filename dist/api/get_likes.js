import { WannaLikes } from "../dist/app/models/likes"

module.exports = async (req, res) => {
    try {
        let likes = {}
        await req.body.forEach(id => {
            likes[id] = WannaLikes.query("article_id").eq(id).count().exec().count
        })
        // Respond with a object populated with key value pairs of IDs and counts
        res.status(200).send(likes)
    }
    catch (err) {
        res.status(500).send(err)
    }
}