import { UpsertWebColorService, GetWebColorService } from "../services/WebColorServices.js";

export const UpsertWebColor = async (req, res) => {
    const result = await UpsertWebColorService(req);
    res.status(200).json(result);
}

export const GetWebColor = async (req, res) => {
    const result = await GetWebColorService(req);
    res.status(200).json(result);
}
