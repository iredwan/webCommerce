import { UpsertPoliceStation, GetAllPoliceStations, GetPoliceStationsByDistrictID } from "../../services/DivisionDistrictPoliceStationService/PoliceStationServices.js";

export const UpsertPoliceStationController = async (req, res) => {
    try {
        const result = await UpsertPoliceStation(req, res);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const GetAllPoliceStationsController = async (req, res) => {
    try {
        const result = await GetAllPoliceStations(req, res);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const GetPoliceStationsByDistrictIDController = async (req, res) => {
    try {
        const result = await GetPoliceStationsByDistrictID(req, res);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
} 