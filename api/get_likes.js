import { WannaLikes, WannaLikeCounts, connectTo } from "../dist/app/javascript/dynamoose_schema.js";
connectTo.smart();

module.exports = async (req, res) => {
  try {
    let likes = {};
    const identity = req.query.identity;
    for (const id of req.query.likable) {
      console.log("Processing item:", id);
      const count = await WannaLikeCounts.get({ article_id: id });
      console.log(id, "has", count?.likes, "likes");
      const liked = await WannaLikes.get({article_id: id, identity});
      if (liked) console.log("The user liked this article before");
      likes[id] = {likeCountValue: count?.likes, likeLikedValue: !!liked};
      console.log("Processing complete for", id, "with", likes[id]);
    }
    // Respond with a object populated with key value pairs of IDs and counts
    res.status(200).send(likes);
  }
  catch (err) {
    res.status(500).send(err);
  }
};