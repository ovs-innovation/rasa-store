const express = require('express');
const router = express.Router();
const { isAuth, isAdmin } = require('../config/auth');
const {
  addCategory,
  addAllCategory,
  getAllCategory,
  getAllCategories,
  getShowingCategory,
  getCategoryById,
  updateCategory,
  updateStatus,
  deleteCategory,
  deleteManyCategory,
  updateManyCategory,
  updateFeatured,
  syncShopCategories

} = require('../controller/categoryController');

//add a category
router.post('/add', isAuth, isAdmin, addCategory);

// sync shop categories (Shoes & Bags) for product assignment
router.post('/sync-shop', isAuth, isAdmin, syncShopCategories);

//add all category
router.post('/add/all', isAuth, isAdmin, addAllCategory);

//get only showing category
router.get('/show', getShowingCategory);

//get all category
router.get('/', getAllCategory);
//get all category
router.get('/all', getAllCategories);

//get a category
router.get('/:id', getCategoryById);

//update a category
router.put('/:id', isAuth, isAdmin, updateCategory);

//show/hide a category
router.put('/status/:id', isAuth, isAdmin, updateStatus);

//featured status a category
router.put('/featured/:id', isAuth, isAdmin, updateFeatured);

//delete a category
router.delete('/:id', isAuth, isAdmin, deleteCategory);

// delete many category
router.patch('/delete/many', isAuth, isAdmin, deleteManyCategory);

// update many category
router.patch('/update/many', isAuth, isAdmin, updateManyCategory);

module.exports = router;
