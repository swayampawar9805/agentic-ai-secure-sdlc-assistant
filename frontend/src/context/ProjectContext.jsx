import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { initialProjects } from "../data/mockProjects";

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem("secureguard_projects");

      return saved
        ? JSON.parse(saved)
        : initialProjects;
    } catch {
      return initialProjects;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "secureguard_projects",
      JSON.stringify(projects)
    );
  }, [projects]);

  const addProject = (projectData) => {
    const newProject = {
      ...projectData,
      id: `PRJ-${Date.now()}`,
      status: "Active",
      securityScore: null,
      vulnerabilities: null,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setProjects((previous) => [
      newProject,
      ...previous,
    ]);

    return newProject;
  };

  const deleteProject = (id) => {
    setProjects((previous) =>
      previous.filter((project) => project.id !== id)
    );
  };

  const getProject = (id) => {
    return projects.find((project) => project.id === id);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        addProject,
        deleteProject,
        getProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error(
      "useProjects must be used inside ProjectProvider"
    );
  }

  return context;
}