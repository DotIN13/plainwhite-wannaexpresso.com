import * as dynamoose from "dynamoose"

dynamoose.aws.sdk.config.update({
    "accessKeyId": process.env.DYNAMOID_KEY_ID,
    "secretAccessKey": process.env.DYNAMOID_KEY_SECRET,
    "region": "us-west-1"
});

// dynamoose.aws.ddb.local()

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

const WannaLikes = dynamoose.model("wanna_likes", schema, { "create": true, "throughput": 5, "prefix": "dynamoose_" })

module.exports = async (req, res) => {
    try {
        let likes = {}
        for (const id of JSON.parse(req.body))
            likes[id] = await WannaLikes.query("article_id").eq(id).count().exec()
        // Respond with a object populated with key value pairs of IDs and counts
        res.status(200).send(likes)
    }
    catch (err) {
        res.status(500).send(err)
    }
}