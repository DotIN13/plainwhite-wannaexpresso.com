import * as dynamoose from "dynamoose"

dynamoose.aws.sdk.config.update({
    "accessKeyId": process.env.DYNAMOID_KEY_ID,
    "secretAccessKey": process.env.DYNAMOID_KEY_SECRET,
    "region": "us-west-1"
});

// dynamoose.aws.ddb.local()

const countSchema = new dynamoose.Schema({
    "article_id": {
        "type": String,
        "hashKey": true
    },
    "likes": {
        "type": Number,
        "default": 0,
        "required": true
    }
}, {
    "timestamps": true
});

const WannaLikeCounts = dynamoose.model("wanna_like_counts", countSchema, { "create": true, "throughput": 5, "prefix": "dynamoose_" });

module.exports = async (req, res) => {
    try {
        let likes = {}
        for (const id of JSON.parse(req.body))
            likes[id] = (await WannaLikeCounts.get({ "article_id": id }))?.likes
        // Respond with a object populated with key value pairs of IDs and counts
        // console.log(likes)
        res.status(200).send(likes)
    }
    catch (err) {
        res.status(500).send(err)
    }
}