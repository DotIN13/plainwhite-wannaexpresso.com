import * as dynamoose from "dynamoose";
import articles from "../dist/app/assets/articles.json";

dynamoose.aws.sdk.config.update({
    "accessKeyId": process.env.DYNAMOID_KEY_ID,
    "secretAccessKey": process.env.DYNAMOID_KEY_SECRET,
    "region": "us-west-1"
});

// dynamoose.aws.ddb.local()

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
});

const WannaLikes = dynamoose.model("wanna_likes", schema, { "create": true, "throughput": 5, "prefix": "dynamoose_" });

module.exports = async (req, res) => {
    const id = req.query.article_id;
    const identity = req.headers["x-forwarded-for"] + req.headers["user-agent"];
    let like;
    console.log(`Processing ${req.query.cancel ? "cancel task" : "like task"} for`, id);
    try {
        // Delete like if cancel params were provided
        if (req.query.cancel) {
            // Get like item for deletion
            like = await WannaLikes.get({ "article_id": id, "identity": identity });
            // Delete like if found existing one
            if (like) { await like.delete(); }
            // Throw an error if existing like was not found
            if (!like) { throw new Error("No existing likes to delete"); }
            console.log("Deleted like for", id);
        }
        else {
            like = await WannaLikes.create({
                "article_id": id,
                "identity": identity
            });
            console.log("Liked", id);
        }
        res.status(200).send(like);
    }
    catch (err) {
        console.log("Processing ended with error", err)
        res.status(500).send(err);
    }
}