import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from "helmet";
import mongoose from "mongoose";
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";


//Router
import UserOTPApi from "./src/routes/UserOTPApi.js"
import WebColorApi from "./src/routes/WebColorApi.js"
import UserApi from "./src/routes/UserApi.js"
import DivisionApi from "./src/routes/DivisionDistrictPS/DivisionApi.js"
import DistrictApi from "./src/routes/DivisionDistrictPS/DistrictApi.js"
import PSApi from "./src/routes/DivisionDistrictPS/PSApi.js"
import UserInfoApi from "./src/routes/UserInfoApi.js"
import uploadFileApi from "./src/routes/UploadFileApi.js";
import ProductApi from "./src/routes/ProductApi.js";
import CategoryApi from "./src/routes/CategoryApi.js";

dotenv.config();
const app = express();



// App Use Default Middleware
app.use(cors({ 
    credentials: true, 
    origin: 'http://localhost:3000', 
    
    
      }));
app.use(express.json({limit: process.env.MAX_JSON_SIZE}));
app.use(express.urlencoded({ extended: process.env.URL_ENCODE }));
app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );
app.use(cookieParser());


// App Use Limiter
const limiter=rateLimit({windowMs:process.env.REQUEST_TIME,max:process.env.REQUEST_NUMBER})
app.use(limiter)

// // Cache
// if (process.env.WEB_CACHE === "false") {
//   app.disable("etag");
// } else {
//   app.set("etag", "strong"); // default
// }

// Database Connect
mongoose.connect(process.env.DATABASE,{autoIndex:true}).then(()=>{
    console.log("MongoDB connected");
}).catch(()=>{
    console.log("MongoDB disconnected");
})



//Router
app.use('/api', uploadFileApi);
app.use("/api/user",UserOTPApi)
app.use("/api/web-color",WebColorApi)
app.use("/api/user", UserApi)
app.use("/api/division", DivisionApi)
app.use("/api/district", DistrictApi)
app.use("/api/ps", PSApi)
app.use("/api/user-info", UserInfoApi)
app.use("/api/products", ProductApi);
app.use("/api/category", CategoryApi);

app.use("/upload-file", express.static("uploads"));


app.listen(process.env.PORT,()=>{
    console.log("Server started on port "+process.env.PORT)
})


