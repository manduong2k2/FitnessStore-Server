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
        const accountId = jwt.verify(req.headers.authorization, 'ABC').account.id;
        const user = await Account.findByPk(accountId, {
            include: [
                {
                    model: Order,
                    as: 'Orders',
                    include: [
                        {
                            model: Item,
                            as: 'Items'
                        }
                    ],
                },
            ],
        });

        if (!user) {
            return res.status(404).json({ error: 'Tài khoản không tồn tại' });
        }

        const items = getUserItems(user);

        const recommenddedProductIds = await UBCF(items);

        const recommenddedProducts = await Product.findAll({
            where:{
                id:recommenddedProductIds
            }
        });

        res.json( recommenddedProducts );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

function getUserItems(user){
    const items = user.Orders.flatMap((order) => order.Items).map(item => ({
        user_id: user.id,
        product_id: item.product_id,
        rating: item.rating
    }));

    const groupedItems = items.reduce((acc, item) => {
        const key = `${item.user_id}_${item.product_id}`;
        if (!acc[key]) {
            acc[key] = { sum: 0, count: 0 };
        }
        acc[key].sum += item.rating;
        acc[key].count += 1;
        return acc;
    }, {});

    const averageItems = Object.entries(groupedItems).map(([key, value]) => {
        const [userId, productId] = key.split('_');
        return {
            user_id: parseInt(userId, 10),
            product_id: parseInt(productId, 10),
            avgRating: value.sum / value.count
        };
    });
    return averageItems;
}

async function UBCF(targetUserItems) {
    const allUsers = await Account.findAll({
        include: [
            {
                model: Order,
                as: 'Orders',
                include: [
                    {
                        model: Item,
                        as: 'Items'
                    }
                ],
            },
        ],
    });

    // Tính toán độ tương đồng giữa target user và các users khác
    const similarities = [];
    for (const user of allUsers) {
        if (user.id !== targetUserItems[0].user_id) {
            const commonItems = getCommonItems(targetUserItems, getUserItems(user));
            const similarity = calculateSimilarity(targetUserItems, getUserItems(user), commonItems);
            if(similarity>0)
            similarities.push({user, similarity});
        }
    }
    similarities.sort((a, b) => b.similarity - a.similarity);
    // Lấy ra 5 user tương đồng
    const topSimilarUsers = similarities.slice(0, 5);
    // Trả về các items của mỗi user đó, loại bỏ các items đã có trong targetUserItems
    const recommendations = [];
    for (const { user } of topSimilarUsers) {
        const userItems = getUserItems(user);
        const newItems = userItems.filter(item => !targetUserItems.some(targetItem => targetItem.product_id === item.product_id));
        newItems.forEach(item => {
            recommendations.push( item.product_id );
        });
    }
    return recommendations;
}

// Hàm tính toán độ tương đồng giữa hai users
function calculateSimilarity(user1Items, user2Items, commonItems) {
    const intersectionSize = commonItems.length;
    const unionSize = new Set([...user1Items, ...user2Items].map(item => item.product_id)).size;
    if (unionSize === 0) {
        return 0;
    }
    return intersectionSize / unionSize;
}

// Hàm lấy ra các items chung giữa hai users
function getCommonItems(user1Items, user2Items) {
    return user1Items.filter(item1 => {
        const commonItem2 = user2Items.find(item2 => item2.product_id === item1.product_id);
        if (commonItem2) {
            const ratingDifferenceSquared = Math.pow(item1.avgRating - commonItem2.avgRating, 2);
            return ratingDifferenceSquared <= 1;
        }
        return false;
    });
}

router.get('/topSolds',async (req,res)=>{
    const products = await Product.findAll({
        include:{
            model:Order,
            as:'order_id_Orders',
            include:{
                model:Item,
                as:'Items'
            }
        }
    });
    const mappedProducts = products.map((p) => {
        let totalQuantity = 0;
        p.order_id_Orders.forEach((o) => {
            o.Items.forEach((i) => {
                if (i.product_id === p.id) {
                    totalQuantity += i.quantity;
                }
            });
        });
        return {
                ...p.get({ plain: true}),
                totalQuantity: totalQuantity || 0
        };
    });
    sortedProducts=mappedProducts.sort((a,b)=>b.totalQuantity - a.totalQuantity);
    res.json(sortedProducts);
});

router.get('/topRating', async (req, res) => {
    const products = await Product.findAll({
        include: {
            model: Order,
            as: 'order_id_Orders',
            include: {
                model: Item,
                as: 'Items'
            }
        }
    });

    const mappedProducts = products.map((p) => {
        let totalRating = 0;
        let count = 0;
        p.order_id_Orders.forEach((o) => {
            o.Items.forEach((i) => {
                if (i.product_id === p.id && i.rating) {
                    totalRating += i.rating;
                    count++;
                }
            });
        });

        
        const avgRating = count ? (totalRating / count).toFixed(1) : 0;

        return {
            ...p.get({ plain: true }),
            avgRating: parseFloat(avgRating)
        };
    });

    const sortedProducts = mappedProducts.sort((a, b) => b.avgRating - a.avgRating);
    res.json(sortedProducts);
});
router.get('/watched', async (req, res) => {
    try {
        const accountId = jwt.verify(req.headers.authorization, 'ABC').account.id;
        const user = await Account.findByPk(accountId, {
            include: [
                {
                    model: Watch,
                    as: 'Watches',
                    include: [
                        {
                            model: Product,
                            as: 'product'
                        }
                    ],
                },
                {
                    model: Order,
                    as: 'Orders',
                    include: [
                        {
                            model: Item,
                            as: 'Items'
                        }
                    ],
                }
            ],
        });

        if (!user) {
            return res.status(404).json({ error: 'Tài khoản không tồn tại' });
        }
        // Filter watched products that do not exist in user's orders
        const watchedProductsNotInOrders = user.Watches.filter(watch => {
            return !user.Orders.some(order => {
                return order.Items.some(item => item.product_id === watch.product_id);
            });
        });

        res.json( watchedProductsNotInOrders.map(w=>w.product) );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});
module.exports = router;