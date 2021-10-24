import dynamoose from "dynamoose";
import articles from "./articles.js";

const likeSchema = new dynamoose.Schema(
  {
    article_id: {
      type: String,
      hashKey: true,
      validate: (val) => Object.values(articles).indexOf(val) != -1
    },
    identity: {
      type: String,
      rangeKey: true,
      validate: /WA1\.[a-z0-9]{9}\.\d{10,}/
    }
  }, {
    timestamps: true
  }
);

const countSchema = new dynamoose.Schema(
  {
    article_id: {
      type: String,
      hashKey: true
    },
    likes: {
      type: Number,
      default: 0,
      required: true
    }
  }, {
    timestamps: true
  }
);

const loveSchema = new dynamoose.Schema(
  {
    username: {
      type: String,
      hashKey: true,
      required: true
    },
    message: {
      type: String,
      rangeKey: true
    },
    week: {
      type: String,
      index: {
        name: "weekIndex",
        global: true
      }
    }
  }, {
    timestamps: true
  }
);

const WannaLikes = dynamoose.model("wanna_likes", likeSchema, { create: true, throughput: 5, prefix: "dynamoose_" });
const WannaLikeCounts = dynamoose.model("wanna_like_counts", countSchema, { create: true, throughput: 5, prefix: "dynamoose_" });
const LoveIncubator = dynamoose.model("love_incubator", loveSchema, { create: true, throughput: 3, prefix: "dynamoose_" });

const connectTo = {
  dev() {
    dynamoose.aws.ddb.local();
    console.log("Connected to dev server.");
  },

  prod() {
    dynamoose.aws.sdk.config.update({
      accessKeyId: process.env.DYNAMOID_KEY_ID,
      secretAccessKey: process.env.DYNAMOID_KEY_SECRET,
      region: "us-west-1"
    });
  },

  smart() {
    if (process.env.NODE_ENV !== "production") this.dev();
    if (process.env.NODE_ENV === "production") this.prod();
  }
};

export { WannaLikes, WannaLikeCounts, LoveIncubator, connectTo, articles };