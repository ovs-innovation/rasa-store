const express = require('express');
const router = express.Router();
const { isAuth, isAdmin } = require('../config/auth');
const {
  addCoupon,
  addAllCoupon,
  getAllCoupons,
  getShowingCoupons,
  getCouponById,
  updateCoupon,
  updateStatus,
  deleteCoupon,
  updateManyCoupons,
  deleteManyCoupons,
} = require('../controller/couponController');

//add a coupon
router.post('/add', isAuth, isAdmin, addCoupon);

//add multiple coupon
router.post('/add/all', isAuth, isAdmin, addAllCoupon);

//get all coupon
router.get('/', isAuth, isAdmin, getAllCoupons);

//get only enable coupon
router.get('/show', getShowingCoupons);

//get a coupon
router.get('/:id', isAuth, isAdmin, getCouponById);

//update a coupon
router.put('/:id', isAuth, isAdmin, updateCoupon);

//update many coupon
router.patch('/update/many', isAuth, isAdmin, updateManyCoupons);

//show/hide a coupon
router.put('/status/:id', isAuth, isAdmin, updateStatus);

//delete a coupon
router.delete('/:id', isAuth, isAdmin, deleteCoupon);

//delete many coupon
router.patch('/delete/many', isAuth, isAdmin, deleteManyCoupons);

module.exports = router;
