require('dotenv').config();
const express=require('express');
const axios=require('axios');
const redis=require('redis');
const app=express();
const PORT=3000||process.env.PORT;

//redis client
const redisclient=redis.createClient();