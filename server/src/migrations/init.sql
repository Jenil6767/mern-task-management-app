CREATE TABLE IF NOT EXISTS organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  inviteCode VARCHAR(64) UNIQUE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin','Member') NOT NULL DEFAULT 'Member',
  organizationId INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt DATETIME DEFAULT NULL,
  CONSTRAINT fk_users_org FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

CREATE INDEX idx_users_org ON users (organizationId);

CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  organizationId INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt DATETIME DEFAULT NULL,
  CONSTRAINT fk_projects_org FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

CREATE INDEX idx_projects_org ON projects (organizationId);

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('TODO','IN_PROGRESS','DONE') NOT NULL DEFAULT 'TODO',
  priority ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
  dueDate DATETIME DEFAULT NULL,
  assignedTo INT DEFAULT NULL,
  projectId INT NOT NULL,
  organizationId INT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completedAt DATETIME DEFAULT NULL,
  deletedAt DATETIME DEFAULT NULL,
  CONSTRAINT fk_tasks_project FOREIGN KEY (projectId) REFERENCES projects(id),
  CONSTRAINT fk_tasks_assigned_user FOREIGN KEY (assignedTo) REFERENCES users(id),
  CONSTRAINT fk_tasks_org FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

CREATE INDEX idx_tasks_project_org ON tasks (projectId, organizationId);
CREATE INDEX idx_tasks_assignee_status ON tasks (assignedTo, status);
CREATE INDEX idx_tasks_dueDate ON tasks (dueDate);

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  taskId INT NOT NULL,
  userId INT NOT NULL,
  action VARCHAR(32) NOT NULL,
  changes JSON,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_task FOREIGN KEY (taskId) REFERENCES tasks(id),
  CONSTRAINT fk_activity_user FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX idx_activity_taskId ON activity_logs (taskId);

-- Optional join table for project assignments
CREATE TABLE IF NOT EXISTS project_users (
  projectId INT NOT NULL,
  userId INT NOT NULL,
  PRIMARY KEY (projectId, userId),
  CONSTRAINT fk_project_users_project FOREIGN KEY (projectId) REFERENCES projects(id),
  CONSTRAINT fk_project_users_user FOREIGN KEY (userId) REFERENCES users(id)
);


