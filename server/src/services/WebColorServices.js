import WebColorModel from "../model/WebColorModel.js";



export const UpsertWebColorService = async (req) => {
    try {
      const reqBody = req.body;
      
      // Validate required fields for new configuration
      if (!req.body.primaryColor && !await WebColorModel.findOne()) {
        return {
          status: false,
          message: "Primary color is required for website configuration."
        };
      }
      
      // Check if config exists
      let colorConfig = await WebColorModel.findOne();
      
      if (colorConfig) {
        // Update existing config
        colorConfig = await WebColorModel.findByIdAndUpdate(
          colorConfig._id,
          { $set: reqBody },
          { new: true, runValidators: true }
        );
        
        return {
          status: true,
          message: "Website configuration updated successfully.",
          data: colorConfig
        };
      } else {
        // Create new config
        colorConfig = new WebColorModel(reqBody);
        await colorConfig.save();
        
        return {
          status: true,
          message: "Website configuration created successfully.",
        };
      }
    } catch (e) {
      return {
        status: false,
        message: "Failed to update website configuration.",
        details: e.message
      };
    }
  };

  
  export const GetWebColorService = async () => {
    try {
        const colorConfig = await WebColorModel.findOne();
        return {
            status: true,
            data: colorConfig
        };
    } catch (e) {
        return { 
            status: false, 
            message: "Failed to get website color configuration." };
    }
  }