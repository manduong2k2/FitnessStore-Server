//Router
const express = require('express');
const router = express.Router();
router.use(express.json());
const jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const { sessions, isAuthenticated, isAuthorized } = require('../token.authorizer');

//Model
var sequelize = require('../connect');
const initModels = require('../model/init-models').initModels;
var models = initModels(sequelize);
var Cart = models.Cart;
var Product = models.Product;

// GET all items in the cart
router.get('/:account_id', async (req, res) => {
  const { account_id } = req.params;
  try {
    const cartItems = await Cart.findAll({
      where: { account_id },
      include: {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'image', 'price']
      }
    });
    res.json(cartItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/ids', async (req, res) => {
  try {
    const { ids, account_id } = req.body;
    const cartItems = [];
    for (const product_id of ids) {
      const cart = await Cart.findOne({
        where: { account_id, product_id },
        include: {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image', 'price']
        }
      });
      if (cart) {
        cartItems.push(cart);
      }
    }
    res.json(cartItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT (Update) an item in the cart
router.put('/:product_id/:account_id', async (req, res) => {
  const { product_id, account_id } = req.params;
  try {
    // Kiểm tra xem item đã tồn tại trong giỏ hàng chưa
    const existingCartItem = await Cart.findOne({
      where: { product_id, account_id },
    });

    if (existingCartItem) {
      // Nếu tồn tại, tăng giá trị của number thêm 1
      existingCartItem.number += 1;
      await existingCartItem.save();
      res.json(existingCartItem);
    } else {
      // Nếu chưa tồn tại, thêm mới vào giỏ hàng với number là 1
      const newCartItem = await Cart.create({
        product_id,
        account_id,
        number: 1,
      });
      res.status(201).json(newCartItem);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//Patch (Update) an item in the cart
router.patch('/:product_id/:account_id', async (req, res) => {
  const { product_id, account_id } = req.params;
  try {
    // Kiểm tra xem item đã tồn tại trong giỏ hàng chưa
    const existingCartItem = await Cart.findOne({
      where: { product_id, account_id },
    });
    if (existingCartItem) {
      // Nếu tồn tại, giảm giá trị của number đi 1
      existingCartItem.number -= 1;
      await existingCartItem.save();
      res.json(existingCartItem);
    } else {
      res.status(404).send('item not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// DELETE an item from the cart
router.delete('/:product_id/:account_id', async (req, res) => {
  const { product_id, account_id } = req.params;

  try {
    const deletedCartItem = await Cart.destroy({
      where: { product_id, account_id },
    });

    if (deletedCartItem) {
      res.json({ message: 'Item deleted from cart successfully' });
    } else {
      res.status(404).json({ error: 'Item not found in the cart' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// DELETE an item from the cart
router.delete('/:account_id', async (req, res) => {
  const { account_id } = req.params;

  try {
    const deletedCartItem = await Cart.destroy({
      where: { account_id },
    });

    if (deletedCartItem) {
      res.json({ message: 'Item deleted from cart successfully' });
    } else {
      res.status(404).json({ error: 'Item not found in the cart' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
