"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  styled,
  TableContainer,
  Table,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Box,
  Paper,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useProductContext } from "@/app/(context)/ProductContext";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import LogoLoader from "../(components)/Preloader/Preloader";
import { useExchangeRate } from "../(hooks)/useExchangeRate";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "box-shadow 0.3s",
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
}));

const Dashboard = () => {
  const theme = useTheme();
  const { products } = useProductContext();
  const [isLoading, setIsLoading] = useState(true);
  const { EUR_GHS, loading: rateLoading, error: rateError } = useExchangeRate();

  // Fallback rate in case API fails
  const FALLBACK_RATE = 17.05;

  const chartOptions = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Available Stock Levels",
        font: {
          size: 18,
          weight: 700,
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Stock: ${context.parsed.x}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Stock Level",
          font: {
            size: 14,
            weight: 700,
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
  };

  // loading state for the dashboard screen
  useEffect(() => {
    if (products && products.length > 0) {
      setIsLoading(false);
    }
  }, [products]);

  // Calculate stock levels by product
  const stockLevels = useMemo(() => {
    if (!products) return [];
    return products.map((product: any) => ({
      productName: product.productName,
      availableStock: product.availableStock,
      reorderStock: product.reOrderLevel,
    }));
  }, [products]);

  // Calculate pending invoices by product
  const pendingInvoices = useMemo(() => {
    if (!products) return [];
    return products.reduce((acc: any[], product: any) => {
      const productPendingInvoices = product?.transactions
        ?.filter((txn: any) => txn.invoiceStatus === "Pending")
        .reduce((total: any, txn: any) => total + (txn.valueInEuro || 0), 0);
      acc.push({
        productName: product.productName,
        pendingInvoice: productPendingInvoices,
      });
      return acc;
    }, []);
  }, [products]);

  // Calculate total unconfirmed pickups
  const unconfirmedPickups = useMemo(() => {
    if (!products) return [];
    return products.reduce((acc: any[], product: any) => {
      const productUnconfirmed = product?.transactions?.filter(
        (txn: any) => txn.pickupConfirmed === false && txn.status === "Issue"
      ).length;
      acc.push({
        productName: product.productName,
        unconfirmedPickups: productUnconfirmed,
      });
      return acc;
    }, []);
  }, [products]);

  // Calculate product value in both Euros and Cedis
  const productValue = useMemo(() => {
    if (!products) return [];

    const currentRate = EUR_GHS || FALLBACK_RATE;

    return products.map((product: any) => {
      const valueInEuro = product.availableStock * product.sellingPrice;
      return {
        productName: product.productName,
        valueInEuro,
        valueInCedi: valueInEuro * currentRate,
        exchangeRate: currentRate,
      };
    });
  }, [products, EUR_GHS]);

  // Chart Data for Stock Levels
  const stockChartData = {
    labels: stockLevels?.map((product: any) => product.productName),
    datasets: [
      {
        data: stockLevels?.map((product: any) => product.availableStock),
        backgroundColor: stockLevels?.map((product: any) =>
          product.availableStock < product.reorderStock
            ? "rgba(255, 99, 132, 0.8)"
            : "rgba(54, 162, 235, 0.8)"
        ),
        borderColor: stockLevels?.map((product: any) =>
          product.availableStock < product.reorderStock
            ? "rgb(255, 99, 132)"
            : "rgb(54, 162, 235)"
        ),
        borderWidth: 1,
        borderRadius: 8,
        hoverBackgroundColor: stockLevels?.map((product: any) =>
          product.availableStock < product.reorderStock
            ? "rgba(255, 99, 132, 1)"
            : "rgba(54, 162, 235, 1)"
        ),
      },
    ],
  };

  // Prepare transactions data for DataGrid
  const transactionsData = useMemo(() => {
    if (!products) return [];
    const allTransactions = products.flatMap((product: any) =>
      product?.transactions?.map((transaction: any) => ({
        id: transaction._id, // Ensure unique id for DataGrid
        ...transaction,
        productName: product.productName,
        date: new Date(transaction.createdAt),
      }))
    );
    // Sort transactions by date in descending order (newest first)
    return allTransactions.sort(
      (a: any, b: any) => b.date.getTime() - a.date.getTime()
    );
  }, [products]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "Transaction ID", width: 150 },
    { field: "productName", headerName: "Product Name", width: 150 },
    {
      field: "date",
      headerName: "Date",
      width: 180,
      valueFormatter: (params: any) => {
        return params?.value?.toLocaleDateString();
      },
    },
    {
      field: "receivedFromIssuedTo",
      headerName: "Received From / Issued To",
      width: 200,
    },
    { field: "qtyReceived", headerName: "Qty Received", width: 150 },
    { field: "qtyIssued", headerName: "Qty Issued", width: 150 },
    { field: "invoiceStatus", headerName: "Invoice Status", width: 150 },
    {
      field: "pickupConfirmed",
      headerName: "Pickup Confirmed",
      width: 150,
      type: "boolean",
    },
  ];

  const CardTitle = styled(Typography)(({ theme }) => ({
    fontSize: "1.2rem",
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  }));

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: "bold",
    backgroundColor: theme.palette.background.default,
  }));

  const formatNumber = (number: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(number);
  };

  if (isLoading) {
    return <LogoLoader />;
  }

  return (
    <Grid container spacing={3}>
      {/* Stock Levels Chart */}
      <Grid item xs={12} md={6}>
        <StyledCard>
          <CardContent>
        <CardTitle variant="h6" gutterBottom>
          Stock Level Overview
        </CardTitle>
        <div style={{ 
          height: "600px", 
          width: "100%", 
          overflow: "auto",
          borderRadius: "8px",
          border: "1px solid rgba(0, 0, 0, 0.12)"
        }}>
          <TableContainer component={Paper} style={{ 
            height: "100%",
            boxShadow: "none"
          }}>
            <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell 
           
              >
            Product Name
              </StyledTableCell>
              <StyledTableCell 
            align="right"
              >
            Stock Level
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stockLevels.map((item: any) => (
              <TableRow 
            key={item.productName}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
              >
            <TableCell sx={{ fontWeight: 500 }}>{item.productName}</TableCell>
            <TableCell
              align="right"
              sx={{
                fontWeight: 500,
                background: item.availableStock < item.reorderStock
              ? "rgba(255, 99, 132, 0.1)"
              : "rgba(54, 162, 235, 0.1)",
                color: item.availableStock < item.reorderStock
              ? "rgb(255, 99, 132)"
              : "rgb(54, 162, 235)"
              }}
            >
              {item.availableStock}
            </TableCell>
              </TableRow>
            ))}
          </TableBody>
            </Table>
          </TableContainer>
        </div>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* Product Value in Euro and Cedi */}
      <Grid item xs={12} md={6}>
        <StyledCard>
          <CardContent>
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Grid item>
                <CardTitle variant="h6">
                  Product Value (in Euros and Cedis)
                </CardTitle>
              </Grid>
              <Grid item>
                <Typography variant="body2" color="primary">
                  {rateLoading ? (
                    <span style={{ animation: "pulse 2s infinite" }}>
                      Loading exchange rate...
                    </span>
                  ) : rateError ? (
                    <Typography color="error">
                      Using fallback rate: 1 EUR = {FALLBACK_RATE} GHS
                    </Typography>
                  ) : (
                    `Current rate: 1 EUR = ${EUR_GHS?.toFixed(2)} GHS`
                  )}
                </Typography>
              </Grid>
            </Grid>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Product Name</StyledTableCell>
                    <StyledTableCell align="right">Value (€)</StyledTableCell>
                    <StyledTableCell align="right">Value (₵)</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productValue?.map((item: any) => (
                    <TableRow key={item.productName}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell align="right">
                        {formatNumber(item.valueInEuro, "EUR")}
                      </TableCell>
                      <TableCell align="right">
                        {formatNumber(item.valueInCedi, "GHS")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* Pending Invoices */}
      <Grid item xs={12} md={6}>
        <StyledCard>
          <CardContent>
            <CardTitle>Pending Invoices by Product (in Euros)</CardTitle>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Product Name</StyledTableCell>
                    <StyledTableCell align="right">
                      Pending Invoice (€)
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingInvoices?.map((item: any) => (
                    <TableRow key={item.productName}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell align="right">
                        {formatNumber(item.pendingInvoice, "EUR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* Unconfirmed Pickups */}
      <Grid item xs={12} md={6}>
        <StyledCard>
          <CardContent>
            <CardTitle>Unconfirmed Pickups by Product</CardTitle>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Product Name</StyledTableCell>
                    <StyledTableCell align="right">
                      Unconfirmed Pickups
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unconfirmedPickups?.map((item: any) => (
                    <TableRow key={item.productName}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell align="right">
                        {item.unconfirmedPickups}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* Recent Transactions */}
      <Grid item xs={12}>
        <StyledCard>
          <CardContent>
            <CardTitle>Recent Transactions</CardTitle>
            <div style={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={transactionsData}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 5 },
                  },
                }}
                pageSizeOptions={[5, 10, 20]}
                checkboxSelection
                disableRowSelectionOnClick
                getRowId={(row) => row?.id || 1}
                sx={{
                  "& .MuiDataGrid-cell:hover": {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            </div>
          </CardContent>
        </StyledCard>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
