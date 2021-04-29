import { WannaLikes, WannaLikeCounts, connectTo, articles } from "../dist/app/javascript/dynamoose_schema.js";
connectTo.dev();

(async () => {
  try {
    for (const art of Object.values(articles)) {
      let updatedCount;
      console.log("Processing ", art);
      const res = await WannaLikes.query('article_id').eq(art).count().exec();
      const count = res.count;
      console.log(art, " has ", count, "likes");
      if (count > 0) {
        updatedCount = await WannaLikeCounts.update({ article_id: art }, { $SET: { likes: count } });
        console.log("Updated counts with ", updatedCount, "\n");
      }
    }
  }
  catch (err) {
    console.log("Counting ended with error: ", err);
  }
})();