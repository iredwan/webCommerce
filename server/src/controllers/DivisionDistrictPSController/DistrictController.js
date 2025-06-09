import { UpsertDistrict, GetAllDistricts, GetDistrictsByDivisionID } from "../../services/DivisionDistrictPoliceStationService/DistrictServices.js";

export const UpsertDistrictController = async (req, res) => {
    try {
        const result = await UpsertDistrict(req, res);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const GetAllDistrictsController = async (req, res) => {
    try {
        const result = await GetAllDistricts(req, res);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const GetDistrictsByDivisionIDController = async (req, res) => {
    try {
        const result = await GetDistrictsByDivisionID(req, res);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
} 