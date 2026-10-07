import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getProjects as fetchProjects,
    getProject as fetchProjectById,
    createProject as createProjectApi,
    updateProject as updateProjectApi,
    deleteProject as deleteProjectApi,
} from "../services/projectService";


const ProjectContext = createContext(null);


export function ProjectProvider({ children }) {

    const [projects, setProjects] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(null);


    const loadProjects = async () => {

        setLoading(true);
        setError(null);

        try {

            const data =
                await fetchProjects();

            setProjects(data);

        } catch (error) {

            console.error(
                "Failed to load projects:",
                error
            );

            setError(
                "Failed to load projects."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadProjects();

    }, []);


    const addProject = async (
        projectData
    ) => {

        setError(null);

        try {

            const newProject =
                await createProjectApi(
                    projectData
                );

            setProjects(
                (previous) => [
                    newProject,
                    ...previous,
                ]
            );

            return newProject;

        } catch (error) {

            console.error(
                "Failed to create project:",
                error
            );

            setError(
                "Failed to create project."
            );

            throw error;
        }
    };


    const updateProject = async (
        id,
        projectData
    ) => {

        setError(null);

        try {

            const updatedProject =
                await updateProjectApi(
                    id,
                    projectData
                );

            setProjects(
                (previous) =>
                    previous.map(
                        (project) =>
                            project.id === id
                                ? updatedProject
                                : project
                    )
            );

            return updatedProject;

        } catch (error) {

            console.error(
                "Failed to update project:",
                error
            );

            setError(
                "Failed to update project."
            );

            throw error;
        }
    };


    const deleteProject = async (
        id
    ) => {

        setError(null);

        try {

            await deleteProjectApi(id);

            setProjects(
                (previous) =>
                    previous.filter(
                        (project) =>
                            project.id !== id
                    )
            );

        } catch (error) {

            console.error(
                "Failed to delete project:",
                error
            );

            setError(
                "Failed to delete project."
            );

            throw error;
        }
    };


    const getProject = (id) => {

        return projects.find(
            (project) =>
                project.id === Number(id)
        );
    };


    const getProjectById = async (
        id
    ) => {

        const existingProject =
            getProject(id);

        if (existingProject) {

            return existingProject;
        }


        const project =
            await fetchProjectById(id);


        setProjects(
            (previous) => {

                const alreadyExists =
                    previous.some(
                        (item) =>
                            item.id === project.id
                    );

                if (alreadyExists) {
                    return previous;
                }

                return [
                    ...previous,
                    project,
                ];
            }
        );


        return project;
    };


    return (
        <ProjectContext.Provider
            value={{
                projects,
                loading,
                error,
                addProject,
                updateProject,
                deleteProject,
                getProject,
                getProjectById,
                refreshProjects:
                    loadProjects,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
}


export function useProjects() {

    const context =
        useContext(ProjectContext);


    if (!context) {

        throw new Error(
            "useProjects must be used inside ProjectProvider"
        );
    }


    return context;
}