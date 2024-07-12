require("dotenv").config();
const express = require("express");
const axios = require("axios");
const redis = require("redis");
const app = express();
const PORT = 3000 || process.env.PORT;

//redis client
const redisclient = redis.createClient();

redisclient.on("error", (err) => {
  console.log("redis error", err);
});

app.get("/weather", async (req, res) => {
  const city = req.query.city;
  const apiKey = process.env.VISUAL_CROSSING_API_KEY;
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?key=${apiKey}`;

  // check cache first
  redisclient.get(city, async (err, cachedData) => {
    if (err) {
      console.log("error in redis", err);
      return res.json("server error");
    }
    if (cachedData) {
      res.json(JSON.parse(cachedData));
    } else {
      //fetch data otherwise
      try {
        const response = await axios.get(url);
        const data = response.data;
        //10 hr expiration on data stored in cache
        redisclient.setEx(city, 36000, JSON.stringify(data));
        res.json(data);
      } catch (err) {
        console.error("api error", err);
        res.json("failed to fetch data");
      }
    }
  });
});
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
