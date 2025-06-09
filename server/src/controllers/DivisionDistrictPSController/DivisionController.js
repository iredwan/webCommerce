import { UpsertDivisionService, GetAllDivisionsService } from "../../services/DivisionDistrictPoliceStationService/DivisionServices.js";

export const UpsertDivisionController = async (req, res) => {
    try {
        const result = await UpsertDivisionService(req, res);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const GetAllDivisionsController = async (req, res) => {
    try {
        const result = await GetAllDivisionsService(req, res);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

