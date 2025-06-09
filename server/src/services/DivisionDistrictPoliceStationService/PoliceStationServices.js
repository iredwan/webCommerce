import PSModel from "../../model/DivisionDistrictPS/PSModel.js";

export const UpsertPoliceStation = async (req, res) => {
    try {
        const { name, bengaliName, districtId, order } = req.body;
        const policeStation = await PSModel.findOne({ name: name, districtId: districtId });
        if (policeStation) {
            await PSModel.findOneAndUpdate(
                { name: name, districtId: districtId },
                { name, bengaliName, districtId, order }
            );
            return {
                success: true,
                message: "Police Station updated successfully",
                data: policeStation
            }
        } else {
            const newPoliceStation = await PSModel.create({ name, bengaliName, districtId, order });
            return {
                success: true,
                message: "Police Station created successfully",
                data: newPoliceStation
            }
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

export const GetAllPoliceStations = async (req, res) => {
    try {
        const policeStations = await PSModel.find();
        return {
            success: true,
            message: "Police Stations fetched successfully",
            data: policeStations
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

// Get Police Stations by District ID
export const GetPoliceStationsByDistrictID = async (req, res) => {
    try {
        const { districtId } = req.params;
        const policeStations = await PSModel.find({ districtId: districtId });
        return {
            success: true,
            message: "Police Stations fetched successfully",
            data: policeStations
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}
