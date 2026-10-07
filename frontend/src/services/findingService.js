import api from "../api/axios";


export const getFindings = async () => {

    const response =
        await api.get("/findings/");

    return response.data;
};


export const getFindingsByScan = async (
    scanId
) => {

    const response =
        await api.get(
            "/findings/",
            {
                params: {
                    scan: scanId,
                },
            }
        );

    return response.data;
};


export const getFinding = async (
    id
) => {

    const response =
        await api.get(
            `/findings/${id}/`
        );

    return response.data;
};


export const createFinding = async (
    findingData
) => {

    const response =
        await api.post(
            "/findings/",
            findingData
        );

    return response.data;
};


export const updateFinding = async (
    id,
    findingData
) => {

    const response =
        await api.patch(
            `/findings/${id}/`,
            findingData
        );

    return response.data;
};


export const deleteFinding = async (
    id
) => {

    await api.delete(
        `/findings/${id}/`
    );

};
