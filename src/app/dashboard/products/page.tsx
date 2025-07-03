'use client';
import { useState, useMemo, useEffect } from 'react';
import {
  PlusCircle,
  Search,
  Edit,
  Package,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import Header from '@/app/(components)/Header';
import CreateProductModal from './CreateProductModal';
import { useProductContext } from '@/app/(context)/ProductContext';
import toast from 'react-hot-toast';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  Grid,
  Paper,
  IconButton,
  InputAdornment,
} from '@mui/material';
import ProductSkeleton from './ProductSkeleton';
// TypeScript Interfaces
interface Product {
  _id: string;
  productName: string;
  sellingPrice: number;
  availableStock: number;
  reOrderLevel: number;
  imageUrl?: string;
  description?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

type ProductContextType = {
  products: Product[] | null;
  getAllProducts: () => void;
  addProduct: (product: Omit<Product, '_id'>) => void;
  getProductById: (id: string) => Promise<Product | null>;
  updateProduct: (id: string, product: Omit<Product, '_id'>) => void;
  deleteProduct: (id: string) => void;
  issueProduct: (id: string, quantity: number) => void;
  restockProduct: (id: string, quantity: number) => void;
};

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { products, addProduct, updateProduct, deleteProduct } =
    useProductContext();

  const filteredProducts = useMemo(() => {
    return products?.filter((product) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsCreateModalOpen(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdateProduct = async (updatedProduct:any) => {
    if (selectedProduct?._id) {
      updateProduct(selectedProduct._id, updatedProduct);
      setIsCreateModalOpen(false);
      toast.success('Product updated successfully');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
       deleteProduct(productId);
      
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleCreateProduct = async (newProduct: any) => {
    try {
      addProduct(newProduct);
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error('Failed to create product');
    }
  };

  return (
    <Box sx={{ width: '95%', mx: 'auto', p: 0 }}>
      {/* Search and Create Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 4,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TextField
          fullWidth
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ maxWidth: { sm: '400px' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setSelectedProduct(null);
            setIsCreateModalOpen(true);
          }}
          startIcon={<PlusCircle size={20} />}
          sx={{
            whiteSpace: 'nowrap',
            minWidth: { xs: '100%', sm: 'auto' },
          }}
        >
          Create Product
        </Button>
      </Box>

      {/* Header */}
      <Header name="Products" />

      {/* Products Grid */}
      {isLoading ? (
        <ProductSkeleton count={6} />
      ):filteredProducts?.length === 0 ? (
        <Paper
          elevation={3}
          sx={{
            mt: 4,
            p: 4,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Package size={48} color="#9e9e9e" />
          <Typography variant="h6" color="text.secondary">
            No products available. Click <strong>Create Product</strong> to add
            a product.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {filteredProducts?.map((product) => (
            <Grid item xs={12} sm={6} lg={4} key={product._id}>
              <Card
                elevation={3}
                sx={{
                  height: '100%',
                  width: '80%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 8,
                  },
                }}
              >
                <Box sx={{ position: 'relative', paddingTop: '66.66%' }}>
                  <Image
                    src="/photo_2024-10-15_18-40-50.jpg"
                    alt={product.productName}
                    fill
                    style={{
                      objectFit: 'cover',
                    }}
                  />
                  {product.availableStock <= product.reOrderLevel && (
                    <Chip
                      label="Low Stock"
                      color="error"
                      size="small"
                      icon={<AlertCircle size={16} />}
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                      }}
                    />
                  )}
                </Box>

                <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  >
                    {product.productName}
                  </Typography>

                  <Box
                    sx={{
                      mt: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography color="text.secondary">Price</Typography>
                      <Typography variant="h6" component="span">
                        €{product?.sellingPrice.toFixed(2)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography color="text.secondary">Stock</Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontWeight: 500,
                          color:
                            product?.availableStock <= product.reOrderLevel
                              ? 'error.main'
                              : 'success.main',
                        }}
                      >
                        {product?.availableStock}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography color="text.secondary">
                        Reorder Level
                      </Typography>
                      <Typography component="span" sx={{ fontWeight: 500 }}>
                        {product.reOrderLevel}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleEditClick(product)}
                    startIcon={<Edit size={18} />}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteProduct(product._id)}
                    startIcon={<Trash2 size={18} />}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProduct}
        onUpdate={handleUpdateProduct}
        selectedProduct={selectedProduct}
      />
    </Box>
  );
};

export default Products;
