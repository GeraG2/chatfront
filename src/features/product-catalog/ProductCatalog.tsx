// File: src/features/product-catalog/ProductCatalog.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Fade,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { Product } from '../../types/types';
import { API_BASE_URL } from '../../constants';
import { useClientContext } from '../../context/ClientContext';

const ProductRow: React.FC<{ product: Product; onEdit: (p: Product) => void; onDelete: (id: string) => void }> = ({ product, onEdit, onDelete }) => (
  <TableRow
    sx={{ 
      '&:hover': { bgcolor: 'action.hover' },
      transition: '0.2s',
      '&:last-child td, &:last-child th': { border: 0 } 
    }}
  >
    <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
      {product.name}
    </TableCell>
    <TableCell>{product.description}</TableCell>
    <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>
      ${Number(product.price).toFixed(2)}
    </TableCell>
    <TableCell>
      <Box sx={{ 
        display: 'inline-block', 
        px: 1, 
        py: 0.5, 
        borderRadius: 1, 
        bgcolor: 'background.default',
        border: '1px solid',
        borderColor: 'divider',
        fontWeight: 500,
        fontSize: '0.875rem'
      }}>
        {product.stock} un.
      </Box>
    </TableCell>
    <TableCell align="right">
      <Tooltip title="Editar">
        <IconButton onClick={() => onEdit(product)} color="primary" size="small" sx={{ mr: 1 }}>
          <EditTwoToneIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Eliminar">
        <IconButton onClick={() => onDelete(product.id)} color="error" size="small">
          <DeleteTwoToneIcon />
        </IconButton>
      </Tooltip>
    </TableCell>
  </TableRow>
);

const ProductCatalog: React.FC = () => {
  const { activeClientId: clientId } = useClientContext();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!clientId) return;
    try {
      // CORRECCIÓN: Usamos la ruta anidada /api/clients/... que tienes en server.js
      const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}/products`);
      if (response.ok) {
        setProducts(await response.json());
      } else {
        console.error("Error fetching products:", response.status);
      }
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  useEffect(() => {
    if (clientId) {
        fetchProducts();
    } else {
        setProducts([]); 
    }
  }, [clientId]);

  const handleSave = async () => {
    if (!clientId) return;
    try {
      // CORRECCIÓN: Ajustamos también las rutas de guardado
      const url = currentProduct.id
        ? `${API_BASE_URL}/api/clients/${clientId}/products/${currentProduct.id}`
        : `${API_BASE_URL}/api/clients/${clientId}/products`;
      
      const method = currentProduct.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProduct),
      });

      if (!response.ok) throw new Error('Error al guardar');
      
      fetchProducts();
      setIsDialogOpen(false);
      setCurrentProduct({});
    } catch (e) {
      setError("No se pudo guardar el producto.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!clientId || !window.confirm("¿Estás seguro?")) return;
    try {
      // CORRECCIÓN: Ajustamos la ruta de borrado
      await fetch(`${API_BASE_URL}/api/clients/${clientId}/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (e) {
      setError("Error al eliminar.");
    }
  };

  if (!clientId) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8, opacity: 0.7 }}>
        <ShoppingBagIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Selecciona un cliente arriba para gestionar su catálogo.
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in={true}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Catálogo de Productos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestiona el inventario que el bot puede ofrecer.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => { setCurrentProduct({}); setIsDialogOpen(true); }}
            sx={{ borderRadius: 2, px: 3, py: 1, boxShadow: 3 }}
          >
            Nuevo Producto
          </Button>
        </Box>

        {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>{error}</Alert>}

        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'light' ? '#f8fafc' : '#1e293b' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Precio</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Stock</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductRow 
                    key={product.id} 
                    product={product} 
                    onEdit={(p) => { setCurrentProduct(p); setIsDialogOpen(true); }} 
                    onDelete={handleDelete} 
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No hay productos en el catálogo de este cliente.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{currentProduct.id ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nombre del Producto"
                fullWidth
                value={currentProduct.name || ''}
                onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
              />
              <TextField
                label="Descripción"
                fullWidth
                multiline
                rows={3}
                value={currentProduct.description || ''}
                onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Precio"
                  type="number"
                  fullWidth
                  InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
                  value={currentProduct.price || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                />
                <TextField
                  label="Stock"
                  type="number"
                  fullWidth
                  value={currentProduct.stock || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, stock: Number(e.target.value) })}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} variant="contained">Guardar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default ProductCatalog;