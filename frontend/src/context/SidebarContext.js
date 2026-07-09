import React, { useState, useMemo, createContext } from "react";

// create context
export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const toggleCartDrawer = () => setCartDrawerOpen(!cartDrawerOpen);
  const closeCartDrawer = () => setCartDrawerOpen(false);

  const toggleCategoryDrawer = () => setCategoryDrawerOpen(!categoryDrawerOpen);
  const closeCategoryDrawer = () => setCategoryDrawerOpen(false);

  const toggleFilterDrawer = () => setFilterDrawerOpen(!filterDrawerOpen);
  const closeFilterDrawer = () => setFilterDrawerOpen(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const closeModal = () => setIsModalOpen(false);
  
  const toggleSearch = () => setShowSearch(!showSearch);
  const closeSearch = () => setShowSearch(false);

  const handleChangePage = (p) => {
    setCurrentPage(p);
  };

  const value = useMemo(
    () => ({
      cartDrawerOpen,
      toggleCartDrawer,
      closeCartDrawer,
      setCartDrawerOpen,
      categoryDrawerOpen,
      toggleCategoryDrawer,
      closeCategoryDrawer,
      filterDrawerOpen,
      toggleFilterDrawer,
      closeFilterDrawer,
      isModalOpen,
      toggleModal,
      closeModal,
      mobileSortOpen,
      setMobileSortOpen,
      showSearch,
      toggleSearch,
      closeSearch,
      setShowSearch,
      currentPage,
      setCurrentPage,
      handleChangePage,
      isLoading,
      setIsLoading,
    }),

    [
      cartDrawerOpen,
      categoryDrawerOpen,
      filterDrawerOpen,
      isModalOpen,
      mobileSortOpen,
      currentPage,
      isLoading,
      showSearch,
    ]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};
