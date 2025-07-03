import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { v4 } from "uuid";
import Header from "@/app/(components)/Header";
import toast from "react-hot-toast";

type ProductFormData = {
  productName: string;
  stockKeepingUnit: string;
  reOrderLevel: number;
  sellingPrice: number;
};

type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: ProductFormData) => void;
  onUpdate?: (formData: ProductFormData) => void;
  selectedProduct?: ProductFormData | null;
};

const CreateProductModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  selectedProduct,
}: CreateProductModalProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    stockKeepingUnit: "",
    reOrderLevel: 0,
  });

  // Populate the form when editing an existing product
  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        productName: selectedProduct.productName,
        stockKeepingUnit: selectedProduct.stockKeepingUnit,
        reOrderLevel: selectedProduct.reOrderLevel,
        sellingPrice: selectedProduct.sellingPrice,
      });
    } else {
      setFormData({ productName: "", stockKeepingUnit: "", reOrderLevel: 0 });
    }
  }, [selectedProduct]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "reOrderLevel" ? parseFloat(value) : value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedProduct) {
      onUpdate?.(formData);
      setFormData({
        productName: "",
        stockKeepingUnit: "",
        reOrderLevel: 0,
        sellingPrice: 0,
      });
    } else {
      onCreate(formData);
      setFormData({ productName: "", stockKeepingUnit: "", reOrderLevel: 0 });
    }
    onClose();
  };

  if (!isOpen) return null;

  const labelCssStyles = "block text-sm font-medium text-gray-700";
  const inputCssStyles =
    "block w-full mb-2 p-2 border-gray-500 border-2 rounded-md";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header
          name={selectedProduct ? "Edit Product" : "Create New Product"}
        />
        <form onSubmit={handleSubmit} className="mt-5">
          {/* PRODUCT NAME */}
          <label htmlFor="productName" className={labelCssStyles}>
            Product Name
          </label>
          <input
            type="text"
            name="productName"
            placeholder="Product Name"
            onChange={handleChange}
            value={formData.productName}
            className={inputCssStyles}
            required
          />

          {/* STOCK KEEPING UNIT */}
          <label htmlFor="stockKeepingUnit" className={labelCssStyles}>
            Stock Keeping Unit (SKU)
          </label>
          <input
            type="text"
            name="stockKeepingUnit"
            placeholder="Stock Keeping Unit"
            onChange={handleChange}
            value={formData.stockKeepingUnit}
            className={inputCssStyles}
            required
          />

          {/* REORDER LEVEL */}
          <label htmlFor="reOrderLevel" className={labelCssStyles}>
            Re-Order Level
          </label>
          <input
            type="number"
            name="reOrderLevel"
            placeholder="Re-Order Level"
            onChange={handleChange}
            value={formData.reOrderLevel}
            className={inputCssStyles}
            required
          />
          {selectedProduct && (
            <label htmlFor="reOrderLevel" className={labelCssStyles}>
              Selling Price
            </label>
          )}
          {selectedProduct && (
            <input
              type="number"
              name="sellingPrice"
              placeholder="Selling Price"
              onChange={handleChange}
              value={formData.sellingPrice}
              className={inputCssStyles}
              required
            />
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            {selectedProduct ? "Edit Product" : "Create Product"}
          </button>
          <button
            onClick={onClose}
            type="button"
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;
