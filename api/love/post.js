import { LoveIncubator, connectTo } from "../../dist/app/javascript/dynamoose_schema.js";
import firstDay from "../../dist/app/javascript/week.js";
import { prependStream } from "../../dist/app/javascript/love_incubator_message.js";
connectTo.smart();

export default async (req, res) => {
  console.log("Processing love");
  try {
    const love = await LoveIncubator.create({
      week: firstDay(),
      message: req.body.message,
      username: req.body.username
    });
    console.log("Saved love:", love);
    res.setHeader("Content-Type", "text/vnd.turbo-stream.html");
    res.status(200).send(prependStream([love]));
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};