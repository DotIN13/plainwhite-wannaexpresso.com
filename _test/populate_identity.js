import { WannaLikes, connectTo } from "../dist/app/javascript/dynamoose_schema.js";
import dynamoose from "dynamoose";
connectTo.prod();

// const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const records = await WannaLikes.scan().all().exec();
  const json = records.toJSON();
  for (const rec of json) {
    const timeHash = ~~(Date.now() / 1000).toString();
    // https://stackoverflow.com/a/47496558
    const randomHash = [...Array(9)].map(() => Math.random().toString(36)[2]).join('');
    const identity = `WA1.${randomHash}.${timeHash}`;
    rec.identity = identity;
    delete rec.createdAt;
    delete rec.updatedAt;
  }
  console.log(json.length);
  try {
    for (let i = 0; i < json.length - 1; i += 24) {
      console.log(json.slice(i, i+ 24));
      await WannaLikes.batchPut(json.slice(i, i + 24));
    }
  } catch (e) {
    console.log(e);
  }
})();