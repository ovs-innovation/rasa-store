import { Avatar, TableBody, TableCell, TableRow } from "@windmill/react-ui";

import CheckBox from "@/components/form/others/CheckBox";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import ShowHideButton from "@/components/table/ShowHideButton";
import useUtilsFunction from "@/hooks/useUtilsFunction";

const BrandTable = ({
  brands,
  isCheck,
  setIsCheck,
  handleUpdate,
  handleModalOpen,
}) => {
  const { showingTranslateValue } = useUtilsFunction();

  const handleClick = (e) => {
    const { id, checked } = e.target;
    setIsCheck([...isCheck, id]);
    if (!checked) {
      setIsCheck(isCheck.filter((item) => item !== id));
    }
  };

  return (
    <>
      <TableBody>
        {brands?.map((brand) => (
          <TableRow key={brand._id}>
            <TableCell>
              <CheckBox
                type="checkbox"
                name="brand"
                id={brand._id}
                handleClick={handleClick}
                isChecked={isCheck?.includes(brand._id)}
              />
            </TableCell>
            <TableCell className="font-semibold uppercase text-xs">
              {brand?._id?.substring(brand?._id?.length - 6)}
            </TableCell>
            <TableCell>
              {brand?.logo ? (
                <Avatar
                  className="hidden mr-3 md:block bg-gray-50 p-1"
                  src={brand?.logo}
                  alt={showingTranslateValue(brand?.name)}
                />
              ) : (
                <Avatar
                  src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
                  alt="brand"
                  className="hidden p-1 mr-2 md:block bg-gray-50 shadow-none"
                />
              )}
            </TableCell>
            <TableCell className="font-medium text-sm">
              <div className="flex flex-col">
                <span>{showingTranslateValue(brand?.name)}</span>
                {brand?.websiteUrl && (
                  <span className="text-xs text-blue-500 break-all">
                    {brand.websiteUrl}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="text-sm">
              {showingTranslateValue(brand?.description)}
            </TableCell>
            <TableCell className="text-center capitalize">
              {brand?.isFeatured ? "Yes" : "No"}
            </TableCell>
            <TableCell className="text-center capitalize">
              {brand?.showOnHomepage === false ? "No" : "Yes"}
            </TableCell>
            <TableCell className="text-center">
              <ShowHideButton id={brand._id} status={brand.status} />
            </TableCell>
            <TableCell className="text-right">
              <EditDeleteButton
                id={brand?._id}
                title={showingTranslateValue(brand?.name)}
                isCheck={isCheck}
                handleUpdate={handleUpdate}
                handleModalOpen={handleModalOpen}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default BrandTable;

