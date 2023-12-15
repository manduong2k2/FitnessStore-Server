var bodyParser = require('body-parser');

//Router
const express = require('express');
const router = express.Router();
router.use(express.json());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const { sessions, isAuthenticated, isAuthorized } = require('../token.authorizer');

//Model
var sequelize = require('../connect');
const initModels = require('../model/init-models').initModels;
var models = initModels(sequelize);
var Product = models.Product;
var Item = models.Item;
var Order = models.Order;
var Cart = models.Cart;
var Ward = models.wards;
var District = models.districts;
var Province = models.provinces;

router.get('/acc/:account_id', async (req, res) => {
    const account_id = req.params.account_id;
    try {
        const orders = await Order.findAll({
            where: { account_id },
            attributes:['id','date','total'],
            include: [
                {
                    model: Item,
                    as: 'Items',
                    attributes:['quantity','cost','rating'],
                    include:{
                        model: Product,
                        as:'product'
                    }
                },
                {
                    model: Ward,
                    as: 'ward_code_ward',
                    attributes: ['code', 'full_name'],
                    include: [
                        {
                            model: District,
                            as: 'district_code_district',
                            attributes: ['code', 'full_name'],
                            include: [
                                {
                                    model: Province,
                                    as: 'province_code_province',
                                    attributes: ['code', 'full_name'],
                                },
                            ],
                        },
                    ]
                }
            ]
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/ord/:orderId', isAuthenticated, async (req, res) => {
    const orderId = req.params.orderId;
    try {
        const order = await Order.findByPk(orderId, {
            include: [
                {
                    model: Item,
                    as: 'Items'
                }
            ]
        });
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { account_id, ward_code, total , items} = req.body;
        const ids = JSON.parse(items);
        try {
            // Tạo đơn hàng
            const order = await Order.create({
                account_id,
                ward_code,
                date: new Date(),
                total
            });
            const carts = await Cart.findAll({
                where: {
                  account_id,
                  product_id: ids, 
                },
                include: [
                  {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'price'],
                  },
                ],
              });
            const orderItems = await Promise.all(carts.map(async (cart) => {
                const product = await Product.findByPk(cart.product_id);
                const orderItem = await Item.create({
                    order_id: order.id,
                    product_id: product.id,
                    quantity: cart.number,
                    cost: product.price * cart.number
                });
                return orderItem;
            }));
            await Cart.destroy({
                where: { account_id ,product_id: ids, }
            });
            res.status(201).json(order);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } catch (err) {
        console.log(err);
    }
});

router.put('/rating',isAuthenticated,async (req,res)=>{
    const rating = parseInt(req.body.rating);
    const order_id = parseInt(req.body.order_id);
    const product_id = parseInt(req.body.product_id);
    try {
        const item = await Item.findOne({
            where: {
                order_id ,
                product_id
            }
        });

        if (!item) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }

        // Update the rating of the item
        await item.update({ rating });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})




module.exports = router;