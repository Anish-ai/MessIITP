const db = require('../config/db');

// Fetch all roles (with role-based filtering)
const getRoles = async (req, res) => {
  const { email } = req.query; // Get the current user's email from the query

  try {
    // Fetch the current user's role
    const [userRole] = await db.query('SELECT role FROM roles WHERE email = ?', [email]);
    if (!userRole.length) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Fetch roles based on the user's role
    let query = 'SELECT * FROM roles';
    if (userRole[0].role === 'admin') {
      query += " WHERE role IN ('admin', 'cr')"; // Admins can only see admins and CRs
    } else if (userRole[0].role === 'cr') {
      return res.status(403).json({ message: 'Unauthorized' }); // CRs cannot see any roles
    }

    const [roles] = await db.query(query);
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add or update a role (with role-based permissions)
const addOrUpdateRole = async (req, res) => {
  const { email, role } = req.body;
  const { userEmail } = req.query; // Get the current user's email from the query

  try {
    // Fetch the current user's role
    const [userRole] = await db.query('SELECT role FROM roles WHERE email = ?', [userEmail]);
    if (!userRole.length) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check permissions
    if (userRole[0].role === 'admin' && role === 'owner') {
      return res.status(403).json({ message: 'Admins cannot add/update owners' });
    }

    // Add or update the role
    const [existingRole] = await db.query('SELECT * FROM roles WHERE email = ?', [email]);
    if (existingRole.length > 0) {
      await db.query('UPDATE roles SET role = ? WHERE email = ?', [role, email]);
    } else {
      await db.query('INSERT INTO roles (email, role) VALUES (?, ?)', [email, role]);
    }
    res.status(201).json({ message: 'Role updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a role (with role-based permissions)
const deleteRole = async (req, res) => {
  const { email } = req.params;
  const { userEmail } = req.query; // Get the current user's email from the query

  try {
    // Fetch the current user's role
    const [userRole] = await db.query('SELECT role FROM roles WHERE email = ?', [userEmail]);
    if (!userRole.length) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Fetch the role to be deleted
    const [existingRole] = await db.query('SELECT * FROM roles WHERE email = ?', [email]);
    if (existingRole.length === 0) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Check permissions
    if (userRole[0].role === 'admin' && existingRole[0].role === 'owner') {
      return res.status(403).json({ message: 'Admins cannot delete owners' });
    }

    // Delete the role
    await db.query('DELETE FROM roles WHERE email = ?', [email]);
    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getRoles, addOrUpdateRole, deleteRole };