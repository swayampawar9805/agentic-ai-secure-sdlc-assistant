import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";


import {
    getFindings as fetchFindings,
    getFindingsByScan as fetchFindingsByScan,
    getFinding as fetchFindingById,
    createFinding as createFindingApi,
    updateFinding as updateFindingApi,
    deleteFinding as deleteFindingApi,
} from "../services/findingService";


const FindingContext =
    createContext(null);



export function FindingProvider({
    children
}) {

    const [
        findings,
        setFindings
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState(null);


    const getFindingsByScan = async (
        scanId
    ) => {

        setError(null);

        try {

            const data =
                await fetchFindingsByScan(
                    scanId
                );

            return data;

        } catch (error) {

            console.error(
                "Failed to load scan findings:",
                error
            );

            setError(
                "Failed to load scan findings."
            );

            throw error;

        }

    };



    const loadFindings = async () => {

        setLoading(true);
        setError(null);


        try {

            const data =
                await fetchFindings();

            setFindings(data);

        } catch (error) {

            console.error(
                "Failed to load findings:",
                error
            );

            setError(
                "Failed to load findings."
            );

        } finally {

            setLoading(false);

        }

    };



    useEffect(() => {

        loadFindings();

    }, []);



    const addFinding = async (
        findingData
    ) => {

        setError(null);


        try {

            const newFinding =
                await createFindingApi(
                    findingData
                );


            setFindings(
                (previous) => [
                    newFinding,
                    ...previous,
                ]
            );


            return newFinding;

        } catch (error) {

            console.error(
                "Failed to create finding:",
                error
            );

            setError(
                "Failed to create finding."
            );

            throw error;

        }

    };



    const updateFinding = async (
        id,
        findingData
    ) => {

        setError(null);


        try {

            const updatedFinding =
                await updateFindingApi(
                    id,
                    findingData
                );


            setFindings(
                (previous) =>
                    previous.map(
                        (finding) =>
                            finding.id === id
                                ? updatedFinding
                                : finding
                    )
            );


            return updatedFinding;

        } catch (error) {

            console.error(
                "Failed to update finding:",
                error
            );

            setError(
                "Failed to update finding."
            );

            throw error;

        }

    };



    const deleteFinding = async (
        id
    ) => {

        setError(null);


        try {

            await deleteFindingApi(id);


            setFindings(
                (previous) =>
                    previous.filter(
                        (finding) =>
                            finding.id !== id
                    )
            );

        } catch (error) {

            console.error(
                "Failed to delete finding:",
                error
            );

            setError(
                "Failed to delete finding."
            );

            throw error;

        }

    };



    const getFinding = (id) => {

        return findings.find(
            (finding) =>
                finding.id === Number(id)
        );

    };



    const getFindingById = async (
        id
    ) => {

        const existingFinding =
            getFinding(id);


        if (existingFinding) {

            return existingFinding;

        }


        const finding =
            await fetchFindingById(id);


        setFindings(
            (previous) => {

                const alreadyExists =
                    previous.some(
                        (item) =>
                            item.id ===
                            finding.id
                    );


                if (alreadyExists) {

                    return previous;

                }


                return [
                    ...previous,
                    finding,
                ];

            }
        );


        return finding;

    };



    return (

        <FindingContext.Provider
            value={{
                findings,
                loading,
                error,
                addFinding,
                updateFinding,
                deleteFinding,
                getFinding,
                getFindingById,
                getFindingsByScan,
                refreshFindings:
                    loadFindings,
            }}
        >

            {children}

        </FindingContext.Provider>

    );

}



export function useFindings() {

    const context =
        useContext(
            FindingContext
        );


    if (!context) {

        throw new Error(
            "useFindings must be used inside FindingProvider"
        );

    }


    return context;

}
