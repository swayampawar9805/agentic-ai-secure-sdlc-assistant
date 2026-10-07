import api from "../api/axios";


export const getScans = async () => {

    const response =
        await api.get("/scans/");

    return response.data;
};


export const getScan = async (id) => {

    const response =
        await api.get(`/scans/${id}/`);

    return response.data;
};


export const createScan = async (
    scanData
) => {

    const response =
        await api.post(
            "/scans/",
            scanData
        );

    return response.data;
};


export const updateScan = async (
    id,
    scanData
) => {

    const response =
        await api.patch(
            `/scans/${id}/`,
            scanData
        );

    return response.data;
};


export const deleteScan = async (
    id
) => {

    await api.delete(
        `/scans/${id}/`
    );
};