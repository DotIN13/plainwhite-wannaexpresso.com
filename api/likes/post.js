import { WannaLikes, connectTo } from "../../dist/app/javascript/dynamoose_schema.js";
connectTo.smart();

export default async (req, res) => {
  const id = req.query.article_id;
  const identity = req.query.identity;
  let like;
  console.log(`Processing ${req.query.cancel ? "cancel task" : "like task"} for`, id);
  try {
    // Delete like if cancel params were provided
    if (req.query.cancel) {
      // Get like item for deletion
      like = await WannaLikes.get({ article_id: id, identity });
      // Delete like if found existing one
      if (like) { await like.delete(); }
      // Throw an error if existing like was not found
      if (!like) { throw new Error("No existing likes to delete"); }
      console.log("Deleted like for", id);
    }
    else {
      like = await WannaLikes.create({
        article_id: id,
        identity
      });
      console.log("Liked", id);
    }
    res.status(200).send(like);
  }
  catch (err) {
    console.log("Processing ended with error", err);
    res.status(500).send(err);
  }
};