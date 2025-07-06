"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axiosInstance from "../../utils/axiosInstance"; // Ensure Axios is correctly set up
import toast from "react-hot-toast";

type Product = {
  id: string;
  productName: string;
  stockKeepingUnit: string;
  stockQuantity: number;
};

type stockData = {
    qtyReceived: number;
    receivedFrom: string;
    valueInEuro: number;
    sellingPrice: number;
    cediConversionRate: number;
    outOfOrderDate: string;
  };



type ProductContextType = {
  products: any;
  getAllProducts: () => void;
  addProduct: (product: Omit<Product, "id">) => void;
  getProductById: (id: string) => Promise<Product | null>;
  updateProduct: (id: string, product: Omit<Product, "id">) => void;
  deleteProduct: (id: string) => void;
  issueProduct: (id: string, quantity: number) => void;
  restockProduct: (id: string, stockData: stockData) => void;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
};

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<any>(null);

  // Fetch all products
  const getAllProducts = async () => {
    try {
      const {data} = await axiosInstance.get("/products/all");
    
      setProducts(data.product);
    } catch (error:any) {
      console.error("Error fetching products:", error.message);
      toast.error(`${error.response?.data?.message}`, {
        style: {
          fontSize: "19px",
        },
      });
    }
  };

  // Add a new product
  const addProduct = async (product: Omit<Product, "id">) => {
    try {
      const response = await axiosInstance.post("/products/add", product);
      setProducts((prev:any) =>
        prev ? [...prev, response.data.product] : [response.data.product]
      );
      toast.success("Product Added Successfully", {
        style: {
          fontSize: "19px",
        },
      });
    } catch (error:any) {
      console.error("Error adding product:", error);
      toast.error(`${error.response?.data?.message}`, {
        style: {
          fontSize: "19px",
        },
      });
    }
  };

  // Get a single product by ID
  const getProductById = async (id: string) => {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      return response.data.product;
    } catch (error:any) {
      console.error("Error fetching product by ID:", error);
      toast.error(`${error.response?.data?.message}`, {
        style: {
          fontSize: "19px",
        },
      });
      return null;
    }
  };

  // Update a product by ID
  const updateProduct = async (
    id: string,
    updatedProduct: Omit<Product, "id">
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/products/${id}`,
        updatedProduct
      );
      setProducts((prev:any) =>
        prev
          ? prev.map((p:any) => (p.id === id ? response.data.product : p))
          : null
      );
      toast.success("Product Updated Successfully", {
        style: {
          fontSize: "19px",
        },
      });
    } catch (error:any) {
      console.error("Error updating product:", error);
      toast.error(`${error.response?.data?.message}`, {
        style: {
          fontSize: "19px",
        },
      });
    }
  };

  // Delete a product by ID
  const deleteProduct = async (id: string) => {

    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;
    try {
      await axiosInstance.delete(`/products/${id}`);
      setProducts((prev:any) => (prev ? prev.filter((p:any) => p.id !== id) : null));
      toast.success("Product Deleted Successfully", {
        style: {
          fontSize: "19px",
        },
      });
    } catch (error:any) {
      console.error("Error deleting product:", error);
      toast.error(`${error.response?.data?.message}`, {
        style: {
          fontSize: "19px",
        },
      });
    }
  };

  // Issue product by reducing stock quantity
  const issueProduct = async (id: string, quantity:number) => {
    try {
      const response = await axiosInstance.post(
        `/transactions/issue/${id}`,
        quantity
      );
      setProducts((prev:any) =>
        prev
          ? prev.map((p:any) =>
              p.id === id ? { ...p, ...response.data.product } : p
            )
          : null
      );
      toast.success("Product issued successfully", {
        style: {
          fontSize: "19px",
        },
      });
    } catch (error:any) {
      console.error("Error issuing product:", error);
      toast.error(`${error.response?.data?.message}`, {
        style: {
          fontSize: "19px",
        },
      });
    }
  };



  // Restock product by increasing stock quantity
  const restockProduct = async (id: string, stockData: stockData) => {
    try {
      console.log("this is the transaction", { stockData });
      const response = await axiosInstance.post(
        `/transactions/restock/${id}`,
        stockData
      );
      setProducts((prev:any) =>
        prev
          ? prev.map((p:any) =>
              p.id === id ? { ...p, ...response.data.product } : p
            )
          : null
      );
      toast.success("Product restocked successfully", {
        style: {
          fontSize: "19px",
        },
      });
    } catch (error:any) {
      console.error("Error restocking product:", error);
      toast.error(`${error.response?.data?.message}`, {
        style: {
          fontSize: "19px",
        },
      });
    }
  };



  useEffect(() => {
    getAllProducts();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        getAllProducts,
        addProduct,
        getProductById,
        updateProduct,
        deleteProduct,
        issueProduct,
        restockProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
