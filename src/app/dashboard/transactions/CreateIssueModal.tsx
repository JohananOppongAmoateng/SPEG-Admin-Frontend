import React, { ChangeEvent, FormEvent, useState } from "react";
import Header from "@/app/(components)/Header";

type ProductFormData = {
  receivedFromIssuedTo: string;
  invoicedAmount: number;
  qtyIssued: number;
};

type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: ProductFormData) => void;
};

const CreateProductModal = ({
  isOpen,
  onClose,
  onCreate,
}: CreateProductModalProps) => {
  const [formData, setFormData] = useState({
    receivedFromIssuedTo: "",
    qtyIssued: 0,
    invoicedAmount: 0,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "qtyIssued" || name === "invoicedAmount"
          ? parseFloat(value)
          : value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const confirmed = window.confirm("Are you sure you want to save this issue?");
    if (confirmed) {
      onCreate(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  const labelCssStyles = "block text-sm font-medium text-gray-700";
  const inputCssStyles =
    "block w-full mb-2 p-2 border-gray-500 border-2 rounded-md";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header name="Create New Issue" />
        <form onSubmit={handleSubmit} className="mt-5">
          {/* PRODUCT NAME */}
          <label htmlFor="productName" className={labelCssStyles}>
            Farmer Name
          </label>
          <input
            type="text"
            name="receivedFromIssuedTo"
            placeholder="Farmer Name"
            onChange={handleChange}
            value={formData.receivedFromIssuedTo}
            className={inputCssStyles}
            required
          />

          {/*QUANTITY Issued */}
          <label htmlFor="stockQuantity" className={labelCssStyles}>
            Quantity Issued
          </label>
          <input
            type="number"
            name="qtyIssued"
            placeholder="Quantity Issued"
            onChange={handleChange}
            value={formData.qtyIssued}
            className={inputCssStyles}
            required
          />

          {/* Invoice amount */}
          <label htmlFor="productPrice" className={labelCssStyles}>
            Invoice Amount
          </label>
          <input
            type="number"
            name="invoicedAmount"
            placeholder="Invoice Amount"
            onChange={handleChange}
            value={formData.invoicedAmount}
            className={inputCssStyles}
            required
          />

          {/* CREATE ACTIONS */}
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Create
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
