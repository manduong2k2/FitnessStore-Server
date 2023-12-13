var bodyParser = require('body-parser');

//Router
const express = require('express');
const router = express.Router();
router.use(express.json());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const { Op, where } = require('sequelize');
const jwt = require('jsonwebtoken');

//Model
var sequelize = require('../connect');
const initModels = require('../model/init-models').initModels;
var models = initModels(sequelize);
var Product = models.Product;
var Account = models.Account;
var Order = models.Order;
var Item = models.Item;
var Brand = models.Brand;
var Category = models.Category;
var Watch = models.Watch;

router.get('/', async (req, res) => {
    try {
        // Lấy id tài khoản từ headers
        const accountId = jwt.verify(req.headers.authorization, 'ABC').account.id;

        // Tìm tài khoản theo id
        const account = await Account.findByPk(accountId, {
            include: [
                {
                    model: Order,
                    as: 'Orders',
                    include: [
                        {
                            model: Item,
                            as: 'Items',
                            include: [{
                                model: Product,
                                as: 'product',
                            },
                            {
                                model: Order,
                                as: 'order',
                                include: [{
                                    model: Account,
                                    as: 'account',
                                }]
                            }
                            ],
                        }
                    ],
                },
            ],
        });

        if (!account) {
            return res.status(404).json({ error: 'Tài khoản không tồn tại' });
        }

        // Tạo một mảng chung chứa tất cả các mục từ tất cả các đơn hàng
        const allItems = account.Orders.flatMap((order) => order.Items);

        // Tính toán đề xuất dựa trên logic của bạn
        const recommendedProducts = await calculateCollaborativeFilteringRecommendations(allItems);
        console.log(recommendedProducts);
        // Trả về danh sách sản phẩm được đề xuất
        res.json({ recommendedProducts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

async function calculateCollaborativeFilteringRecommendations(allItems) {
    // Tạo một đối tượng để theo dõi độ hài lòng của mỗi sản phẩm
    const productSatisfaction = {};

    // Duyệt qua mỗi mục trong lịch sử mua hàng
    allItems.forEach((item) => {
        const productId = item.product.id;

        // Tính điểm đánh giá dựa trên quantity và rating
        const ratingScore = item.rating * item.quantity;

        // Tính tổng điểm hài lòng cho mỗi sản phẩm
        if (!productSatisfaction[productId]) {
            productSatisfaction[productId] = { score: 0, count: 0 };
        }
        productSatisfaction[productId].score += ratingScore;
        productSatisfaction[productId].count += 1;
    });

    // Tính điểm trung bình hài lòng cho mỗi sản phẩm
    const averageProductSatisfaction = {};
    Object.keys(productSatisfaction).forEach((productId) => {
        const { score, count } = productSatisfaction[productId];
        averageProductSatisfaction[productId] = count > 0 ? score / count : 0;
    });

    // Sắp xếp sản phẩm theo điểm trung bình hài lòng giảm dần
    const sortedProducts = Object.keys(averageProductSatisfaction).sort(
        (a, b) => averageProductSatisfaction[b] - averageProductSatisfaction[a]
    );

    // Chọn ra một số sản phẩm có điểm trung bình hài lòng cao nhất
    const topProductsId = sortedProducts; // Chọn 5 sản phẩm, bạn có thể điều chỉnh số lượng theo nhu cầu

    // Lấy danh sách các sản phẩm có ID nằm trong topProductsId
    const topProducts = await Product.findAll({ where: { id: topProductsId.map(Number) } });

    // Lấy danh sách các brand_id và category_id từ topProducts
    const brandIds = [...new Set(topProducts.map((product) => product.brand_id))];
    const categoryIds = [...new Set(topProducts.map((product) => product.category_id))];

    // Tìm các sản phẩm có brand_id hoặc category_id giống với topProducts
    const relatedProducts = await Product.findAll({
        where: {
            [Op.or]: [
                { brand_id: { [Op.in]: brandIds } },
                { category_id: { [Op.in]: categoryIds } },
            ],
            id: { [Op.notIn]: topProducts.map((product) => product.id) }, // Loại bỏ các sản phẩm đã có trong topProducts
        },
    });

    return relatedProducts;
}

router.get('/watched', async (req, res) => {
    try {
        var account_id = jwt.verify(req.headers.token, 'ABC').account.id;
        const watchlogs = await Watch.findAll(
            {
                where: { account_id },
                order: [[sequelize.literal('times'), 'DESC']],
            }
        );
        const watchedProducts = await Product.findAll({
            where: { id: watchlogs.map(log => log.product_id) },
          });
        res.json(watchedProducts);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});


module.exports = router;