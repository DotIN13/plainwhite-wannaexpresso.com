import { WannaLikes, connectTo } from "../dist/app/javascript/dynamoose_schema.js";
connectTo.dev();

(async () => {
  await WannaLikes.get({article_id: "/moods/night-course", identity: "12"}).then((doc) => {
    if (doc) { doc.delete(); }
    if (!doc) throw new Error("No likes found");
  }).catch((err) => console.log(err));

  await WannaLikes.create({article_id: "/moods/night-course", identity:"12"})
    .then(() => WannaLikes.get({article_id: "/moods/night-course", identity: "12"})).then((doc) => doc.delete());
})();

