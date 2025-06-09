import DistrictModel from "../../model/DivisionDistrictPS/DistrictModel.js";

export const UpsertDistrict = async (req, res) => {
    try {
        const { districtId, name, bengaliName, divisionId, order } = req.body;
        console.log(districtId, name, bengaliName, divisionId, order);
        const district = await DistrictModel.findOne({ districtId: districtId });
        if (district) {
            const updatedDistrict = await DistrictModel.findOneAndUpdate({ districtId: districtId }, { name, bengaliName, divisionId, order });
            return {
                success: true,
                message: "District updated successfully",
                data: updatedDistrict
            }
        } else {
            const newDistrict = await DistrictModel.create({ districtId, name, bengaliName, divisionId, order });
            return {
                success: true,
                message: "District created successfully",
                data: newDistrict
            }
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

export const GetAllDistricts = async (req, res) => {
    try {
        const districts = await DistrictModel.find();
        return {
            success: true,
            message: "Districts fetched successfully",
            data: districts
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

// Get Districts by Division ID
export const GetDistrictsByDivisionID = async (req, res) => {
    try {
        const { divisionId } = req.params;
        const districts = await DistrictModel.find({ divisionId: divisionId });
        return {
            success: true,
            message: "Districts fetched successfully",
            data: districts
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}