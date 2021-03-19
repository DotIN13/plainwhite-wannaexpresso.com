const dynamoose = require("dynamoose");
const articles = require("../dist/app/assets/articles.json");

dynamoose.aws.sdk.config.update({
    "accessKeyId": process.env.DYNAMOID_KEY_ID,
    "secretAccessKey": process.env.DYNAMOID_KEY_SECRET,
    "region": "us-west-1"
});

// dynamoose.aws.ddb.local()

const likeSchema = new dynamoose.Schema({
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
const WannaLikes = dynamoose.model("wanna_likes", likeSchema, { "create": true, "throughput": 5, "prefix": "dynamoose_" });

(async () => {
    try {
        for (const art of Object.values(articles)) {
            let updatedCount;
            console.log("Processing ", art)
            const res = await WannaLikes.query('article_id').eq(art).count().exec();
            const count = res.count
            console.log(art, " has ", count, "likes");
            if (count > 0) {
                 updatedCount = await WannaLikeCounts.update({ 'article_id': art }, { "$SET": { "likes": count } });
                 console.log("Updated counts with ", updatedCount, "\n");
            }
        }
    }
    catch (err) {
        console.log("Counting ended with error: ", err);
    }
})();