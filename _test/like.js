const dynamoose = require("dynamoose");
dynamoose.aws.ddb.local()

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

const WannaLikes = dynamoose.model("wanna_likes", schema, { "create": true, "throughput": 5, "prefix": "dynamoose_" });

(async () => {
    const like = await WannaLikes.create({ "article_id": "12", "identity": "Chrome" })
    console.log(like)
})().catch(err => console.log(err))