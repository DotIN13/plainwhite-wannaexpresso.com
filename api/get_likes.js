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

const likeSchema = new dynamoose.Schema({
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

const WannaLikes = dynamoose.model("wanna_likes", likeSchema, { "create": true, "throughput": 5, "prefix": "dynamoose_" })

const WannaLikeCounts = dynamoose.model("wanna_like_counts", countSchema, { "create": true, "throughput": 5, "prefix": "dynamoose_" });

module.exports = async (req, res) => {
    try {
        let likes = {}
        const identity = req.headers["x-forwarded-for"] + req.headers["user-agent"]
        for (const id of JSON.parse(req.body)) {
            console.log("Processing item:", id)
            const count = await WannaLikeCounts.get({ "article_id": id })
            console.log(id, "has", count?.likes, "likes")
            const liked = await WannaLikes.get({"article_id": id, "identity": identity})
            if (liked) console.log("The user liked this article before")
            likes[id] = {"count": count?.likes, "liked": !!liked}
            console.log("Processing complete for", id, "with", likes[id])
        }
        // Respond with a object populated with key value pairs of IDs and counts
        res.status(200).send(likes)
    }
    catch (err) {
        res.status(500).send(err)
    }
}