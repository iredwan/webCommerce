import jwt from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config();

export const TokenEncode = (email,user_id, role) => {
    let key = process.env.JWT_KEY;
    let expire = process.env.JWT_EXPIRE_TIME;
    console.log(key);
    
    let payload = { email,user_id:user_id, role }; 
    return jwt.sign(payload, key, { expiresIn: expire });
  };
  
  export const TokenDecode = (token) => {
    try {
      let key = process.env.JWT_KEY;
      let decoded = jwt.verify(token, key);
      return decoded; 
    } catch (err) {
      return null;
    }
  };