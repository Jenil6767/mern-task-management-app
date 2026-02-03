import {
  createProject,
  listProjects,
  getProjectByIdForOrg,
  updateProject,
  softDeleteProject,
  assignUsersToProject,
} from '../services/projectService.js';

export const createProjectController = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const project = await createProject({
      name,
      description,
      organizationId: req.organizationId,
    });
    return res.status(201).json(project);
  } catch (err) {
    return next(err);
  }
};

export const listProjectsController = async (req, res, next) => {
  try {
    const projects = await listProjects(req.organizationId);
    return res.json(projects);
  } catch (err) {
    return next(err);
  }
};

export const getProjectController = async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    const project = await getProjectByIdForOrg(projectId, req.organizationId);
    return res.json(project);
  } catch (err) {
    return next(err);
  }
};

export const updateProjectController = async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    const project = await updateProject(projectId, req.organizationId, req.body);
    return res.json(project);
  } catch (err) {
    return next(err);
  }
};

export const deleteProjectController = async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    await softDeleteProject(projectId, req.organizationId);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

export const assignProjectUsersController = async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    const { userIds } = req.body;
    await assignUsersToProject(projectId, req.organizationId, userIds || []);
    return res.status(200).json({ message: 'Users assigned successfully' });
  } catch (err) {
    return next(err);
  }
};



