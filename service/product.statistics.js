//Router
const express = require('express');
const router = express.Router();
const { sessions, isAuthenticated, isAuthorized } = require('../token.authorizer');
const jwt = require('jsonwebtoken');


//Model
var sequelize = require('../connect');
const initModels = require('../model/init-models').initModels;
var models = initModels(sequelize);
var Product = models.Product;
var Brand = models.Brand;
var Category = models.Category;
var Use = models.Use;
var Item = models.Item;
var Order = models.Order;
var Watch = models.Watch;

router.get('/topSales', async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [{
                model: Item,
                as: 'Items',
            }
            ]
        });
        const mappedProducts = products.map(product => {
            // Tính tổng count từ danh sách items của mỗi product
            const totalCount = product.Items.reduce((acc, item) => acc + item.quantity, 0);
            // Tạo đối tượng mới với thông tin cần thiết
            return {
                id: product.id,
                name: product.name,
                count: totalCount,
            };
        });
        const filteredProducts = mappedProducts.filter(product => product.count > 0);
        const sortedProducts = filteredProducts.sort((a, b) => b.count - a.count);
        res.json(sortedProducts);
    } catch (err) {
        console.log(err);
    }
});

router.get('/income/:month/:year', async (req, res) => {
    try {
        const requestedMonth = req.params.month;
        const requestedYear = req.params.year;
        const items = await Item.findAll({
            include: [{
                model: Order,
                as: 'order',
            }]
        });

        const incomeByDate = [];

        items.forEach(item => {
            const orderDate = item.order.date;
            const orderMonth = new Date(orderDate).getMonth() + 1; // Lấy tháng từ orderDate
            const orderYear = new Date(orderDate).getFullYear(); // Lấy năm từ orderDate

            // Kiểm tra xem ngày trong tháng và năm có khớp với tháng và năm được yêu cầu không
            if (orderMonth.toString() === requestedMonth && orderYear.toString() === requestedYear) {
                const existingItem = incomeByDate.find(entry => entry.date === orderDate);

                if (existingItem) {
                    existingItem.income += item.cost;
                } else {
                    incomeByDate.push({ date: orderDate, income: item.cost });
                }
            }
        });

        // Sắp xếp mảng theo ngày từ cũ nhất đến mới nhất
        incomeByDate.sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json(incomeByDate);
    } catch (err) {
        console.log(err);
    }
});

module.exports = router; 