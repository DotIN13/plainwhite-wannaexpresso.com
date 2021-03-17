import { WannaLikes } from "app/assets/models/likes"

module.exports = async (req, res) => {
    try {
        const like = await WannaLikes.create({
            "article_id": req.query.article_id,
            "identity": req.headers["x-forwarded-for"] + req.headers["user-agent"]
        })
        res.status(200).send(like)
    }
    catch (err) {
        res.status(500).send(err)
    }
}