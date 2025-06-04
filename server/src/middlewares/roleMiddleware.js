export const checkRole = (roles) => {
  return (req, res, next) => {
      const userRole = req.headers.role; 
      if(!userRole){
        userRole=req.cookies.role;
    }

      if (!roles.includes(userRole)) {
          return res.status(403).json({ status: false, message: "Access denied" });
      }
      next();
  };
};