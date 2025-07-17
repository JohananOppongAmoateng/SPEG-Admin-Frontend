"use client";
import { useState, useEffect } from "react";
import Header from "@/app/(components)/Header";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridToolbarContainer,
  GridFilterModel,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { Button, Tooltip } from "@mui/material";
import { PlusCircleIcon } from "lucide-react";
import CreateReceiptsModal from "./CreateReceiptsModal";
import { useProductContext } from "@/app/(context)/ProductContext";
import { useExchangeRate } from "../../(hooks)/useExchangeRate";

type Transaction = {
  id: string;
  createdAt: string;
  receivedFromIssuedTo: string;
  qtyReceived: number;
  qtyIssued: number;
  proForma: number;
  invoiced: number;
  collected: number;
  farmerBalance: number;
  availableStock: number;
  stockBalance: number;
  valueInEuro: number;
  valueInCedi: number;
  status: string;
  invoiceStatus: string;
  pickupConfirmed: boolean;
};

type Product = {
  id: string;
  productName: string;
  transactions: Transaction[];
};

// Define columns for transactions table
const columns: GridColDef[] = [
  { field: "id", headerName: "Transaction ID", width: 220 },
  { field: "createdAt", headerName: "Date Created",
     width: 150,
    renderCell: (params) => {
    const date = new Date(params.value);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();
    
    return (
      <Tooltip title={`Signed up on: ${formattedDate} at ${formattedTime}`} arrow>
        <div>{formattedDate}</div>
      </Tooltip>
    );
  } },
  { field: "receivedFromIssuedTo", headerName: "Received From / Issued To", width: 220 },
  { field: "qtyReceived", headerName: "Quantity Received", width: 180, type: "number" },
  { field: "qtyIssued", headerName: "Quantity Issued", width: 180, type: "number" },
  { field: "proForma", headerName: "Farmer Invoice", width: 180, type: "number" },
  { field: "invoiced", headerName: "Invoiced (€)", width: 180, type: "number" },
  { field: "collected", headerName: "Collected", width: 180, type: "number" },
  { field: "farmerBalance", headerName: "Farmer Balance", width: 180, type: "number" },
  { field: "availableStock", headerName: "Available Stock", width: 180, type: "number" },
  { field: "stockBalance", headerName: "Stock Balance", width: 180, type: "number" },
  { field: "valueInEuro", headerName: "Value (€)", width: 180, type: "number" },
  { field: "valueInCedi", headerName: "Value (GH₵)", width: 180, type: "number" },
  { field: "status", headerName: "Status", width: 150 },
  { field: "invoiceStatus", headerName: "Invoice Status", width: 150 },
  {
    field: "pickupConfirmed",
    headerName: "Pickup Confirmed",
    width: 150,
    renderCell: (params) => {
      // only show for issues
      if (params.row.status === "Issue") {
        return <div>params.row.pickupConfirmed.value</div>;
      }
    },
  },
];

const Transactions = () => {
  const FALLBACK_RATE = 17.05;
  const {
      EUR_GHS,
      loading: rateLoading,
      error: rateError
  } = useExchangeRate();
  const currentRate = EUR_GHS || FALLBACK_RATE;
  const { products, issueProduct, restockProduct, getAllProducts } = useProductContext();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isReceiptsModalOpen, setIsReceiptsModalOpen] = useState(false);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [salesFilterActive, setSalesFilterActive] = useState(false);
  const [purchaseFilterActive, setPurchaseFilterActive] = useState(false);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    id: true,
    createdAt: true,
    receivedFromIssuedTo: true,
    qtyReceived: true,
    qtyIssued: true,
    proForma: true,
    invoiced: true,
    collected: true,
    farmerBalance: true,
    availableStock: true,
    stockBalance: true,
    valueInEuro: true,
    valueInCedi: true,
    status: true,
    invoiceStatus: true,
    pickupConfirmed: false,
  });

  useEffect(() => {
    if (products && products.length > 0) {
      setSelectedProduct(products[0]);
    }


  }, [products]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    const product = products.find((prod:any) => prod.id === productId);
    setSelectedProduct(product || null);
  };


  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <div style={{ display: 'flex', gap: '8px', width: '100%', padding: '4px' }}>
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarDensitySelector />
          <GridToolbarExport />
          <div style={{ borderLeft: '1px solid #e0e0e0', marginLeft: '8px', paddingLeft: '8px' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleSales}
              sx={{
                marginRight: 1,
                backgroundColor: salesFilterActive ? '#1976d2' : 'transparent',
                color: salesFilterActive ? 'white' : '#1976d2',
                '&:hover': {
                  backgroundColor: salesFilterActive ? '#1565c0' : 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              Sales Filter
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={handlePurchase}
              sx={{
                backgroundColor: purchaseFilterActive ? '#1976d2' : 'transparent',
                color: purchaseFilterActive ? 'white' : '#1976d2',
                '&:hover': {
                  backgroundColor: purchaseFilterActive ? '#1565c0' : 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              Purchase Filter
            </Button>
          </div>
        </div>
      </GridToolbarContainer>
    );
  };

  const handleCreateReceipt = (receiptData: any) => {
    if (selectedProduct) {
      restockProduct(selectedProduct.id, receiptData);
    }
    setIsReceiptsModalOpen(false);
  };

  const handleSales = () => {
    setSalesFilterActive(!salesFilterActive);
    setPurchaseFilterActive(false);
    if (!salesFilterActive) {
      setFilterModel({
        items: [{ field: "status", operator: "equals", value: "Issue" }],
      });
      setColumnVisibilityModel({
        ...columnVisibilityModel,
        qtyReceived: false,
        availableStock: false,
        stockBalance: false,
        valueInEuro: false,
        valueInCedi: false,
      });
    } else {
      resetFilters();
    }
  };

  const handlePurchase = () => {
    setPurchaseFilterActive(!purchaseFilterActive);
    setSalesFilterActive(false);
    if (!purchaseFilterActive) {
      setFilterModel({
        items: [{ field: "status", operator: "equals", value: "Receipt" }],
      });
      setColumnVisibilityModel({
        ...columnVisibilityModel,
        qtyIssued: false,
        farmerBalance: false,
        proForma: false,
        invoiced: false,
        stockBalance: false,
        valueInCedi: false,
        pickupConfirmed: false,
        collected: false,
        invoiceStatus: false,
      });
    } else {
      resetFilters();
    }
  };

  const resetFilters = () => {
    setFilterModel({ items: [] });
    setColumnVisibilityModel({
      id: true,
      createdAt: true,
      receivedFromIssuedTo: true,
      qtyReceived: true,
      qtyIssued: true,
      proForma: true,
      invoiced: true,
      collected: true,
      farmerBalance: true,
      availableStock: true,
      stockBalance: true,
      valueInEuro: true,
      valueInCedi: true,
      status: true,
      invoiceStatus: true,
      pickupConfirmed: true,
    });
  };

  if (!products || products.length === 0) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="flex flex-col">
      <Header name="Inventory" />
      <div className="text-lg dark:text-white text-right">
                    {rateLoading ? (
                      <span className="animate-pulse">Loading exchange rate...</span>
                    ) : rateError ? (
                      <span className="text-red-500">
                        Using fallback rate: 1 EUR = {FALLBACK_RATE} GHS
                      </span>
                    ) : (
                      <span>
                        Current rate: 1 EUR = {EUR_GHS?.toFixed(2)} GHS
                      </span>
                    )}
        </div>

      <div className="my-4">
        <label
          htmlFor="productSelect"
          className="block text-md font-medium text-black dark:text-gray-200"
        >
          Select Product:
        </label>
        <div className="flex gap-3">
          <select
            id="productSelect"
            value={selectedProduct?.id || ""}
            onChange={handleProductChange}
            className="mt-1 block py-2 px-3 border w-96 border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            {products.map((product:any) => (
              <option key={product.id} value={product.id}>
                {product.productName}
              </option>
            ))}
          </select>
          <button
            className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
            onClick={() => setIsReceiptsModalOpen(true)}
          >
            <PlusCircleIcon className="mr-2" />
            Create Receipts
          </button>
          
        </div>
      </div>

      {selectedProduct && (
        <div className="h-[500px]">
          <DataGrid
            rows={selectedProduct?.transactions?.slice().reverse()}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5 },
              },
            }}
            pageSizeOptions={[5]}
            getRowId={(row) => row.id}
            slots={{
              toolbar: CustomToolbar,
            }}
            filterModel={filterModel}
            onFilterModelChange={(model) => setFilterModel(model)}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel({
              ...columnVisibilityModel,
              ...newModel
            })}
          />
        </div>
      )}

      <CreateReceiptsModal
        isOpen={isReceiptsModalOpen}
        onClose={() => setIsReceiptsModalOpen(false)}
        onCreate={handleCreateReceipt}
        rate ={EUR_GHS}
      />
    </div>
  );
};

export default Transactions;
