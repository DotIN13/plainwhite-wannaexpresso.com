import * as dynamoose from "dynamoose";
dynamoose.aws.sdk.config.update({
    "accessKeyId": process.env.DYNAMOID_KEY_ID,
    "secretAccessKey": process.env.DYNAMOID_KEY_SECRET,
    "region": "us-east-1"
});

const schema = new dynamoose.Schema({
    "article_id": {
        "type": String,
        "hashKey": true
    },
    "identity": {
        "type": String,
        "rangeKey": true
    }
}, {
    "timestamps": true
})

const WannaLikes = dynamoose.model("wanna_likes", schema, {"create": true, "throughput": 5, "prefix": "dynamoose_"})

module.exports = async (req, res) => {
    try {
        const like = await WannaLikes.create({
            "article_id": req.query.article,
            "identity": req.headers["x-forwarded-for"] + req.headers["user-agent"]
        })
        res.status(200).send(like)
    } catch (err) {
        res.status(500).send("Unpermitted like.")
    }
}