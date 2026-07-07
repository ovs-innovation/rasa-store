import PageTitle from "@/components/Typography/PageTitle";
import AnimatedContent from "@/components/common/AnimatedContent";
import ShopCategoryBannersEditor from "@/components/category/ShopCategoryBannersEditor";

const Category = () => {
  return (
    <>
      <PageTitle>Categories</PageTitle>
      <AnimatedContent>
        <ShopCategoryBannersEditor />
      </AnimatedContent>
    </>
  );
};

export default Category;
