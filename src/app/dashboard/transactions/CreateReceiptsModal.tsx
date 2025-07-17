import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Header from "@/app/(components)/Header";
import { useExchangeRate } from "../../(hooks)/useExchangeRate";

type ReceiptFormData = {
    receivedFrom: string;
    qtyReceived: number;
    valueInEuro: number;
    sellingPrice: number;
    cediConversionRate: any;
    outOfOrderDate: string;
};

type CreateReceiptsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (formData: ReceiptFormData) => void;
    rate: any;
};

const CreateReceiptsModal = ({
    isOpen,
    onClose,
    onCreate,
    rate
}: CreateReceiptsModalProps) => {
    const [formData, setFormData] = useState<ReceiptFormData>({
        receivedFrom: "",
        qtyReceived: 0,
        valueInEuro: 0,
        sellingPrice: 0,
        cediConversionRate: rate,
        outOfOrderDate: ""
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]:
                name === "receivedFrom" || name === "outOfOrderDate"
                    ? value
                    : parseFloat(value)
        });
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const confirmed = window.confirm(
            "Are you sure you want to save this receipt?"
        );
        if (confirmed) {
            onCreate(formData);
            onClose();
        }
    };
    useEffect(
        () => {
            setFormData(prevData => ({
                ...prevData,
                cediConversionRate: rate
            }));
        },
        [rate]
    );

    if (!isOpen) return null;

    const labelCssStyles = "block text-sm font-medium text-gray-700";
    const inputCssStyles =
        "block w-full mb-2 p-2 border-gray-500 border-2 rounded-md dark:text-black";

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20 ">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <Header name="Add New Receipt" />
                <form onSubmit={handleSubmit} className="mt-5">
                    <label htmlFor="outOfOrderDate" className={labelCssStyles}>
                        Invoice Date
                    </label>
                    <input
                        type="date"
                        name="outOfOrderDate"
                        onChange={handleChange}
                        value={formData.outOfOrderDate}
                        className={inputCssStyles}
                    />
                    <label htmlFor="receivedFrom" className={labelCssStyles}>
                        Vendor Name
                    </label>
                    <input
                        type="text"
                        name="receivedFrom"
                        placeholder="Received From"
                        onChange={handleChange}
                        value={formData.receivedFrom}
                        className={inputCssStyles}
                        required
                    />

                    <label htmlFor="qtyReceived" className={labelCssStyles}>
                        Quantity Received
                    </label>
                    <input
                        type="number"
                        name="qtyReceived"
                        placeholder="Quantity received"
                        onChange={handleChange}
                        value={formData.qtyReceived}
                        className={inputCssStyles}
                        required
                    />

                    <label htmlFor="valueInEuro" className={labelCssStyles}>
                        Value in Euros
                    </label>
                    <input
                        type="number"
                        name="valueInEuro"
                        placeholder="Value in euros"
                        onChange={handleChange}
                        value={formData.valueInEuro}
                        className={inputCssStyles}
                        required
                    />

                    <label htmlFor="sellingPrice" className={labelCssStyles}>
                        Selling Price
                    </label>
                    <input
                        type="number"
                        name="sellingPrice"
                        placeholder="Selling Price"
                        onChange={handleChange}
                        value={formData.sellingPrice}
                        className={inputCssStyles}
                        required
                    />

                    <label
                        htmlFor="cediConversionRate"
                        className={labelCssStyles}
                    >
                        Cedi Conversion Rate
                    </label>
                    <input
                        type="number"
                        name="cediConversionRate"
                        placeholder="Cedi Conversion Rate"
                        onChange={handleChange}
                        value={formData.cediConversionRate}
                        className={inputCssStyles}
                        required
                    />

                    

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

export default CreateReceiptsModal;
