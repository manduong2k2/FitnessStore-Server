const express = require('express');
const router = express.Router();
router.use(express.json());

var sequelize = require('../connect');
const initModels = require('../model/init-models').initModels;
var models = initModels(sequelize);
var Role = models.Role;

// API GET all roles
router.get('/', async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// API GET - Lấy thông tin của một vai trò cụ thể
router.get('/:id', async (req, res) => {
  const roleId = req.params.id;

  try {
    const role = await Role.findByPk(roleId);
    if (role) {
      res.json(role);
    } else {
      res.status(404).json({ message: 'Role not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// API POST - Tạo mới một vai trò
router.post('/', async (req, res) => {
  const { name } = req.body;

  try {
    const newRole = await Role.create({ name });
    res.status(201).json(newRole);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// API PUT - Cập nhật thông tin của một vai trò
router.put('/:id', async (req, res) => {
  const roleId = req.params.id;
  const { name } = req.body;

  try {
    const role = await Role.findByPk(roleId);
    if (role) {
      role.name = name;
      await role.save();
      res.json(role);
    } else {
      res.status(404).json({ message: 'Role not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// API PATCH - Cập nhật một phần thông tin của một vai trò
router.patch('/:id', async (req, res) => {
  const roleId = req.params.id;
  const { name } = req.body;

  try {
    const role = await Role.findByPk(roleId);
    if (role) {
      role.name = name || role.name;
      await role.save();
      res.json(role);
    } else {
      res.status(404).json({ message: 'Role not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// API DELETE - Xóa một vai trò
router.delete('/:id', async (req, res) => {
  const roleId = req.params.id;

  try {
    const role = await Role.findByPk(roleId);
    if (role) {
      await role.destroy();
      res.json({ message: 'Role deleted successfully' });
    } else {
      res.status(404).json({ message: 'Role not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;