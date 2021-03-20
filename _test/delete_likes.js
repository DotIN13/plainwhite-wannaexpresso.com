const { DH_CHECK_P_NOT_PRIME } = require("constants")
const dynamoose = require("dynamoose")
const fs = require("fs")
const articles = require('../dist/app/assets/articles.json')
dynamoose.aws.ddb.local()

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

const WannaLikes = dynamoose.model("wanna_likes", schema, { "create": true, "throughput": 5, "prefix": "dynamoose_" });

(async () => {
    await WannaLikes.get({"article_id": "/moods/night-course", "identity": "12"}).then((doc) => {
        if (doc) { doc.delete(); }
        if (!doc) throw new Error("No likes found")
    }).catch((err) => console.log(err))

    await WannaLikes.create({"article_id": "/moods/night-course", "identity":"12"})
    .then(() => WannaLikes.get({"article_id": "/moods/night-course", "identity": "12"})).then((doc) => doc.delete())
})()

