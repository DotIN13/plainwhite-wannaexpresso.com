const dynamoose = require("dynamoose")
const fs = require("fs")
// const articles = require('../_site/app/assets/articles.json')
dynamoose.aws.ddb.local()

const articles = fs.readFile("dist/app/assets/articles.json", (err, data) => {
    if (err) throw err

    // console.log(JSON.parse(data))
    return JSON.parse(data)
})


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
    const like = await WannaLikes.create({ "article_id": "Object.values(articles)[0]", "identity": "Chrome" })
    console.log(like)
})().catch(err => console.log(err));