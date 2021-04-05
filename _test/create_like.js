import { WannaLikes, connectTo } from "../dist/app/javascript/dynamoose_schema.js";
connectTo.dev();
// const { wannaLikes, wannaLikeCounts } = require("../_webpack/javascript/shared/dynamoose_schema.js");

(async () => {
  const like = await WannaLikes.create({ article_id: "/moods/night-course", identity: "WA1.sajdiojas.1231231232" });
  console.log(like);
})().catch(err => console.log(err));