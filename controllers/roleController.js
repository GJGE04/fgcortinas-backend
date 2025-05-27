const ROLES = require('../config/roles');

const getRoles = (req, res) => {  // se sustituye por getAvailableRoles
  const availableRoles = Object.values(ROLES); // solo los valores como 'Admin', 'Tecnico', etc.
  res.status(200).json({ roles: availableRoles });
};

const getAvailableRoles = (req, res) => {
  const roles = Object.values(ROLES).map(role => ({
    value: role,
    label: getRoleLabel(role)
  }));
  res.json(roles);
};

const getRoleLabel = (role) => {
  switch (role) {
    case 'Superadmin': return 'Superadmin';
    case 'Admin': return 'Administrador';
    case 'Editor': return 'Editor';
    case 'Vendedor': return 'Vendedor';
    case 'Tecnico': return 'Técnico';
    case 'Guest': return 'Invitado';
    default: return role;
  }
};

module.exports = { getRoles, getAvailableRoles };
