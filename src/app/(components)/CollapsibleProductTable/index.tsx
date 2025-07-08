'use client';
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Box,
  Typography,
  Button,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useProductContext } from '@/app/(context)/ProductContext';

function Row(props:any) {
  const { row } = props;
  const [open, setOpen] = useState(false);
  interface RowProps {
    row: Product;
  }

  interface Product {
    id: string;
    productName: string;
    availableStock: number;
    stockBalance: number;
    sellingPrice: number;
    transactions: Transaction[];
  }

  interface Transaction {
    transactionId: string;
    createdAt: string;
    id: string;
    receivedFromIssuedTo: string;
    qtyReceived: number;
    qtyIssued: number;
    valueInEuro: number;
    status: string;
  }

  const formatNumber = (number: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(number);
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.productName}
        </TableCell>
        <TableCell align="right">{row.availableStock}</TableCell>
        <TableCell align="right">{row.stockBalance}</TableCell>
        <TableCell align="right">
          {formatNumber(row.availableStock * row.sellingPrice, 'EUR')}
        </TableCell>
        <TableCell align="right">
          {formatNumber(row.availableStock * row.sellingPrice * 17.4, 'GHS')}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Transactions
              </Typography>
              <a href="/transactions">
                <Button>View Detailed Transaction</Button>
              </a>
              <Table size="small" aria-label="transactions">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Transaction Id</TableCell>
                    <TableCell>Received From / Issued To</TableCell>
                    <TableCell align="right">Qty Received</TableCell>
                    <TableCell align="right">Qty Issued</TableCell>
                    <TableCell align="right">Value (Euro)</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.transactions?.slice().reverse().map((transactionRow:any) => (
                    <TableRow key={transactionRow.transactionId}>
                      <TableCell component="th" scope="row">
                        {new Date(
                          transactionRow.createdAt
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{transactionRow.id}</TableCell>
                      <TableCell>
                        {transactionRow.receivedFromIssuedTo}
                      </TableCell>
                      <TableCell align="right">
                        {transactionRow.qtyReceived}
                      </TableCell>
                      <TableCell align="right">
                        {transactionRow.qtyIssued}
                      </TableCell>
                      <TableCell align="right">
                        {transactionRow.valueInEuro}
                      </TableCell>
                      <TableCell align="right">
                        {transactionRow.status}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function CollapsibleProductTable() {
  const { products } = useProductContext();
  return (
    <TableContainer
      component={Paper}
      sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
    >
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Product Name</TableCell>
            <TableCell align="right">Available Stock</TableCell>
            <TableCell align="right">Stock Balance</TableCell>
            <TableCell align="right">Value in (Euro)</TableCell>
            <TableCell align="right">Value in (Cedi)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products
            ?.slice()
            .reverse()
            .map((row:any) => (
              <Row key={row?.id} row={row} />
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
