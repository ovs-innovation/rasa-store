import React from "react";
import Scrollbars from "react-custom-scrollbars-2";
import { useTranslation } from "react-i18next";

import LabelArea from "@/components/form/selectOption/LabelArea";
import Title from "@/components/form/others/Title";
import InputArea from "@/components/form/input/InputArea";
import Error from "@/components/form/others/Error";
import TextAreaCom from "@/components/form/input/TextAreaCom";
import Uploader from "@/components/image-uploader/Uploader";
import SwitchToggle from "@/components/form/switch/SwitchToggle";
import DrawerButton from "@/components/form/button/DrawerButton";
import useBrandSubmit from "@/hooks/useBrandSubmit";

const BrandDrawer = ({ id }) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    logoUrl,
    setLogoUrl,
    coverUrl,
    setCoverUrl,
    published,
    setPublished,
    featured,
    setFeatured,
    showOnHomepage,
    setShowOnHomepage,
    handleSelectLanguage,
    isSubmitting,
  } = useBrandSubmit(id);

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {id ? (
          <Title
            register={register}
            handleSelectLanguage={handleSelectLanguage}
            title={t("UpdateBrand")}
            description={t("UpdateBrandDescription")}
          />
        ) : (
          <Title
            register={register}
            handleSelectLanguage={handleSelectLanguage}
            title={t("AddBrand")}
            description={t("AddBrandDescription")}
          />
        )}
      </div>

      <Scrollbars className="w-full relative dark:bg-gray-700 dark:text-gray-200">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 flex-grow scrollbar-hide w-full max-h-full pb-40">
            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={t("BrandName")} />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  required
                  register={register}
                  label={t("BrandName")}
                  name="name"
                  type="text"
                  placeholder={t("BrandName")}
                />
                <Error errorName={errors.name} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={t("BrandDescription")} />
              <div className="col-span-8 sm:col-span-4">
                <TextAreaCom
                  register={register}
                  label={t("BrandDescription")}
                  name="description"
                  placeholder={t("BrandDescription")}
                />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={t("BrandSortOrder")} />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  register={register}
                  label={t("BrandSortOrder")}
                  name="sortOrder"
                  type="number"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={t("BrandLogo")} />
              <div className="col-span-8 sm:col-span-4">
                <Uploader
                  imageUrl={logoUrl}
                  setImageUrl={setLogoUrl}
                  folder="brand"
                  useOriginalSize={true}
                />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={t("BrandCover")} />
              <div className="col-span-8 sm:col-span-4">
                <Uploader
                  imageUrl={coverUrl}
                  setImageUrl={setCoverUrl}
                  folder="brand"
                  targetWidth={800}
                  targetHeight={400}
                />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={t("Published")} />
              <div className="col-span-8 sm:col-span-4">
                <SwitchToggle
                  handleProcess={setPublished}
                  processOption={published}
                />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={t("BrandFeatured")} />
              <div className="col-span-8 sm:col-span-4">
                <SwitchToggle
                  handleProcess={setFeatured}
                  processOption={featured}
                />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
              <LabelArea label="Show on Homepage" />
              <div className="col-span-8 sm:col-span-4">
                <SwitchToggle
                  handleProcess={setShowOnHomepage}
                  processOption={showOnHomepage}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  When off, this brand is hidden from the homepage Shop By Brand section.
                </p>
              </div>
            </div>
          </div>

          <DrawerButton id={id} title="Brand" isSubmitting={isSubmitting} />
        </form>
      </Scrollbars>
    </>
  );
};

export default BrandDrawer;

