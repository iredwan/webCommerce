import DivisionModel from "../../model/DivisionDistrictPS/DivisionModel.js";

export const UpsertDivisionService = async (req, res) => {
    try {
        const { divisionId, name, bengaliName, order } = req.body;
        const division = await DivisionModel.findOne({ divisionId: divisionId });
        if (division) {
            const updatedDivision = await DivisionModel.findOneAndUpdate({ divisionId: divisionId }, { name, bengaliName, order });
            return {
                success: true,
                message: "Division updated successfully",
                data: updatedDivision
            }
        } else {
            const newDivision = await DivisionModel.create({ divisionId, name, bengaliName, order });
            return {
                success: true,
                message: "Division created successfully",
                data: newDivision
            }
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

export const GetAllDivisionsService = async (req, res) => {
    try {
        const divisions = await DivisionModel.find();
        return {
            success: true,
            message: "Divisions fetched successfully",
            data: divisions
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}
