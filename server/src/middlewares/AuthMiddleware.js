import { TokenDecode } from "../utility/tokenUtility.js";



export default (req, res, next) => {
  let token=req.headers['token']
  if(!token){
      token=req.cookies['token']
  }
   // Token Decode
   let decoded=TokenDecode(token)

    if (decoded === null) {
      res.status(401).json({ status: "fail", message: "Unauthorized" });
    } else {
      req.headers.user_id = decoded.user_id
      req.headers.email = decoded.email;
      req.headers.role = decoded.role;
      next();
    }
  };