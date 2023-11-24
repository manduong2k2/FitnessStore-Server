//Router
const express = require('express');
const router = express.Router();

//Model
var sequelize = require('../connect');
const initModels = require('../model/init-models').initModels;
var models = initModels(sequelize);
var Province = models.provinces;
var District = models.districts;
var Ward = models.wards;

// API endpoint
router.get('/provinces', async (req, res) => {
    try {
      const allProvinces = await Province.findAll({
        attributes: ['code', 'full_name'], 
      });
      res.json(allProvinces);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/districts/:provinceCode', async (req, res) => {
  const provinceCode = req.params.provinceCode;

  try {
    const allDistricts = await District.findAll({
      where: { province_code: provinceCode },
      attributes: ['code', 'full_name'], // Chỉ lấy cột 'code' và 'name'
    });
    res.json(allDistricts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/wards/:districtCode', async (req, res) => {
  const districtCode = req.params.districtCode;
  try {
    const allWards = await Ward.findAll({
      where: { district_code: districtCode },
      attributes: ['code', 'full_name'], // Chỉ lấy cột 'code' và 'name'
    });
    res.json(allWards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/location/:wardCode', async (req, res) => {
    const wardCode = req.params.wardCode;
    try {
      const ward = await Ward.findOne({
        where: { code: wardCode },
        include: [
          {
            model: District,
            as: 'district_code_district',
            attributes: ['code', 'name', 'province_code'],
            include: [
              {
                model: Province,
                as: 'province_code_province',
                attributes: ['code', 'name'],
              },
            ],
          },
        ],
        attributes: ['code', 'name', 'district_code'],
      });
      if (!ward) {
        return res.status(404).json({ error: 'Phường không tồn tại' });
      }
      res.json({
        province: { code: ward.district_code_district.province_code_province.code, name: ward.district_code_district.province_code_province.name },
        district: { code: ward.district_code_district.code, name: ward.district_code_district.name },
        ward: { code: ward.code, name: ward.name },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;