import { LoveIncubator, connectTo } from "../../dist/app/javascript/dynamoose_schema.js";
import firstDay from "../../dist/app/javascript/week.js";
import { replaceStream } from "../../dist/app/javascript/love_incubator_message.js";
connectTo.smart();

export default async (_req, res) => {
  console.log("Retrieving love messages...");
  try {
    const messages = await LoveIncubator.query("week").eq(firstDay()).limit(10).exec();
    if (messages) console.log("Retrieved");
    res.setHeader("Content-Type", "text/vnd.turbo-stream.html");
    res.status(200).send(replaceStream(messages));
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};