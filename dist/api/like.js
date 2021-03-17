import * as dynamoose from "dynamoose"
import articles from "dist/app/assets/articles.json"

dynamoose.aws.sdk.config.update({
    "accessKeyId": process.env.DYNAMOID_KEY_ID,
    "secretAccessKey": process.env.DYNAMOID_KEY_SECRET,
    "region": "us-west-1"
});

const schema = new dynamoose.Schema({
    "article_id": {
        "type": String,
        "hashKey": true,
        "validate": (val) => Object.values(articles).indexOf(val) != -1
    },
    "identity": {
        "type": String,
        "rangeKey": true
    }
}, {
    "timestamps": true
})
const WannaLikes = dynamoose.model("wanna_likes", schema, { "create": true, "throughput": 5, "prefix": "dynamoose_" })

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