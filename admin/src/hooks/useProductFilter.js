/* eslint-disable react-hooks/exhaustive-deps */
import Ajv from "ajv";
import csvToJson from "csvtojson";
import * as XLSX from "xlsx";
import { useContext, useState } from "react";

//internal import
import { SidebarContext } from "@/context/SidebarContext";
import ProductServices from "@/services/ProductServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import useDisableForDemo from "./useDisableForDemo";

// custom product upload validation schema
const schema = {
  type: "object",
  properties: {
    categories: { type: "array" },
    image: { type: "array" },
    tag: { type: "array" },
    variants: { type: "array" },
    show: { type: "array" },
    status: { type: "string" },
    prices: { type: "object" },
    isCombination: { type: "boolean" },
    title: { type: "object" },
    productId: { type: "string" },
    slug: { type: "string" },
    category: { type: "object" },
    stock: { type: "number" },
    description: { type: "object" },
  },
  required: ["categories", "category", "prices", "title"],
};

const useProductFilter = (data) => {
  const ajv = new Ajv({ allErrors: true });
  const { setLoading, setIsUpdate } = useContext(SidebarContext);

  const [newProducts] = useState([]);
  const [selectedFile, setSelectedFile] = useState([]);
  const [filename, setFileName] = useState("");
  const [isDisabled, setIsDisable] = useState(false);

  const { handleDisableForDemo } = useDisableForDemo();

  //service data filtering
  const serviceData = data;

  //  console.log('selectedFile',selectedFile)

  const handleOnDrop = (data) => {
    // console.log('data', data);
    for (let i = 0; i < data.length; i++) {
      newProducts.push(data[i].data);
    }
  };

  const handleUploadProducts = () => {
    if (handleDisableForDemo()) {
      return; // Exit the function if the feature is disabled
    }
    if (newProducts.length < 1) {
      notifyError("Please upload/select csv file first!");
    } else {
      if (handleDisableForDemo()) {
        return; // Exit the function if the feature is disabled
      }
      ProductServices.addAllProducts(newProducts)
        .then((res) => {
          notifySuccess(res.message);
        })
        .catch((err) => notifyError(err.message));
    }
  };

  const handleSelectFile = async (e) => {
    e.preventDefault();

    const fileReader = new FileReader();
    const file = e.target?.files[0];

    if (file && file.type === "application/json") {
      setFileName(file?.name);
      setIsDisable(true);

      fileReader.readAsText(file, "UTF-8");
      fileReader.onload = (e) => {
        const text = JSON.parse(e.target.result);

        const productData = text.map((value) => {
          return {
            categories: value.categories,
            image: value.image,
            barcode: value.barcode,
            tag: value.tag,
            variants: value.variants,
            status: value.status,
            prices: value.prices,
            isCombination: JSON.parse(value.isCombination.toLowerCase()),
            title: value.title,
            productId: value.productId,
            slug: value.slug,
            sku: value.sku,
            category: value.category,
            stock: value.stock,
            description: value.description,
          };
        });

        setSelectedFile(productData);
      };
    } else if (file && (file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv"))) {
      setFileName(file?.name);
      setIsDisable(true);

      fileReader.onload = async (event) => {
        const text = event.target.result;
        const json = await csvToJson().fromString(text);
        // console.log("json", json);
        const productData = json.map((value) => {
          // Helper to parse comma-separated values
          const parseCSVArray = (val) => {
            if (!val) return [];
            return val.split(",").map(v => v.trim()).filter(v => v);
          };

          // Helper to parse Yes/No to boolean
          const parseYesNo = (val) => val === "Yes" || val === "true";

          // Helper to parse JSON safely
          const parseJSON = (val, defaultVal = {}) => {
            try {
              return val ? JSON.parse(val) : defaultVal;
            } catch {
              return defaultVal;
            }
          };

          return {
            productId: value.productId || "",
            title: {
              en: value.name || "",
            },
            description: {
              en: value.description || "",
            },
            sku: value.sku || "",
            barcode: value.barcode || "",
            prices: {
              price: Number(value.price) || 0,
              originalPrice: Number(value.originalPrice) || 0,
              discount: Number(value.discount) || 0,
            },
            stock: Number(value.stock) || 0,
            sales: Number(value.sales) || 0,
            image: parseCSVArray(value.images),
            tag: parseCSVArray(value.tags),
            status: value.status || "show",
            taxRate: Number(value.taxRate) || 0,
            isPriceInclusive: parseYesNo(value.isPriceInclusive),
            hsnCode: value.hsnCode || "",
            isCombination: parseYesNo(value.isCombination),
            slug: value.slug || "",
            // These fields need to be provided separately or extracted from category/brand
            category: value.category || null,
            categories: parseCSVArray(value.category) || [],
            variants: parseJSON(value.variants, []),
            brand: value.brand || null,
          };
        });

        setSelectedFile(productData);
      };

      fileReader.readAsText(file);
    } else if (file && (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.name.toLowerCase().endsWith(".xlsx"))) {
      setFileName(file?.name);
      setIsDisable(true);

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = event.target.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Helper to parse comma-separated values
          const parseCSVArray = (val) => {
            if (!val) return [];
            return val.toString().split(",").map(v => v.trim()).filter(v => v);
          };

          // Helper to parse Yes/No to boolean
          const parseYesNo = (val) => val === "Yes" || val === "true";

          // Helper to parse JSON safely
          const parseJSON = (val, defaultVal = {}) => {
            try {
              return val ? (typeof val === "string" ? JSON.parse(val) : val) : defaultVal;
            } catch {
              return defaultVal;
            }
          };

          const productData = jsonData.map((value) => {
            return {
              productId: value.productId || "",
              title: {
                en: value.name || "",
              },
              description: {
                en: value.description || "",
              },
              sku: value.sku || "",
              barcode: value.barcode || "",
              prices: {
                price: Number(value.price) || 0,
                originalPrice: Number(value.originalPrice) || 0,
                discount: Number(value.discount) || 0,
              },
              stock: Number(value.stock) || 0,
              sales: Number(value.sales) || 0,
              image: parseCSVArray(value.images),
              tag: parseCSVArray(value.tags),
              status: value.status || "show",
              taxRate: Number(value.taxRate) || 0,
              isPriceInclusive: parseYesNo(value.isPriceInclusive),
              hsnCode: value.hsnCode || "",
              isCombination: parseYesNo(value.isCombination),
              slug: value.slug || "",
              category: value.category || null,
              categories: parseCSVArray(value.category) || [],
              variants: parseJSON(value.variants, []),
              brand: value.brand || null,
            };
          });

          setSelectedFile(productData);
        } catch (error) {
          notifyError("Error reading Excel file: " + error.message);
          setIsDisable(false);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setFileName(file?.name);
      setIsDisable(true);

      notifyError("Unsupported file type!");
    }
  };

  const handleUploadMultiple = (e) => {
    if (handleDisableForDemo()) {
      return; // Exit the function if the feature is disabled
    }
    if (selectedFile.length > 0) {
      setLoading(true);

      // For CSV imports, we don't need strict validation since the formatter handles it
      ProductServices.importProductsCSV(selectedFile)
        .then((res) => {
          setIsUpdate(true);
          setLoading(false);
          notifySuccess(res.message || "Products imported successfully!");
        })
        .catch((err) => {
          setLoading(false);
          notifyError(err.response?.data?.message || err.message || "Import failed!");
        });
    } else {
      setLoading(false);
      notifyError("Please select a valid JSON or CSV file first!");
    }
  };

  const handleRemoveSelectFile = (e) => {
    // console.log('remove');
    setFileName("");
    setSelectedFile([]);
    setTimeout(() => setIsDisable(false), 1000);
  };

  return {
    data,
    filename,
    isDisabled,
    handleSelectFile,
    serviceData,
    handleOnDrop,
    handleUploadProducts,
    handleRemoveSelectFile,
    handleUploadMultiple,
  };
};

export default useProductFilter;
