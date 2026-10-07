import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getScans as fetchScans,
    getScan as fetchScanById,
    createScan as createScanApi,
    updateScan as updateScanApi,
    deleteScan as deleteScanApi,
} from "../services/scanService";


const ScanContext =
    createContext(null);


export function ScanProvider({
    children
}) {

    const [scans, setScans] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(null);


    const loadScans = async () => {

        setLoading(true);
        setError(null);

        try {

            const data =
                await fetchScans();

            setScans(data);

        } catch (error) {

            console.error(
                "Failed to load scans:",
                error
            );

            setError(
                "Failed to load scans."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadScans();

    }, []);


    const addScan = async (
        scanData
    ) => {

        setError(null);

        try {

            const newScan =
                await createScanApi(
                    scanData
                );

            setScans(
                (previous) => [
                    newScan,
                    ...previous,
                ]
            );

            return newScan;

        } catch (error) {

            console.error(
                "Failed to create scan:",
                error
            );

            setError(
                "Failed to create scan."
            );

            throw error;
        }
    };


    const updateScan = async (
        id,
        scanData
    ) => {

        setError(null);

        try {

            const updatedScan =
                await updateScanApi(
                    id,
                    scanData
                );

            setScans(
                (previous) =>
                    previous.map(
                        (scan) =>
                            scan.id === id
                                ? updatedScan
                                : scan
                    )
            );

            return updatedScan;

        } catch (error) {

            console.error(
                "Failed to update scan:",
                error
            );

            setError(
                "Failed to update scan."
            );

            throw error;
        }
    };


    const deleteScan = async (
        id
    ) => {

        setError(null);

        try {

            await deleteScanApi(id);

            setScans(
                (previous) =>
                    previous.filter(
                        (scan) =>
                            scan.id !== id
                    )
            );

        } catch (error) {

            console.error(
                "Failed to delete scan:",
                error
            );

            setError(
                "Failed to delete scan."
            );

            throw error;
        }
    };


    const getScan = (id) => {

        return scans.find(
            (scan) =>
                scan.id === Number(id)
        );
    };


    const getScanById = async (
        id
    ) => {

        const existingScan =
            getScan(id);

        if (existingScan) {

            return existingScan;
        }


        const scan =
            await fetchScanById(id);


        setScans(
            (previous) => {

                const alreadyExists =
                    previous.some(
                        (item) =>
                            item.id === scan.id
                    );

                if (alreadyExists) {

                    return previous;
                }

                return [
                    ...previous,
                    scan,
                ];
            }
        );


        return scan;
    };


    return (
        <ScanContext.Provider
            value={{
                scans,
                loading,
                error,

                addScan,
                updateScan,
                deleteScan,

                getScan,
                getScanById,

                refreshScans:
                    loadScans,
            }}
        >
            {children}
        </ScanContext.Provider>
    );
}


export function useScans() {

    const context =
        useContext(ScanContext);


    if (!context) {

        throw new Error(
            "useScans must be used inside ScanProvider"
        );
    }


    return context;
}