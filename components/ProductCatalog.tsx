import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Alert,
} from '@mui/material/';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Product, NotificationState } from '../types';
import { API_BASE_URL } from '../constants';
import Notification from './Notification';

const emptyProduct: Product = { id: '', name: '', description: '', price: '', stock: '' };

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product>(emptyProduct);
  
  // Confirm Dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);


  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data: Product[] = await response.json();
      setProducts(data);
      setError(null);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error desconocido al cargar productos';
      setError(errorMessage);
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  const closeNotification = () => setNotification(null);

  // Dialog handlers
  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentProduct(emptyProduct);
    setDialogOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({...prev, [name]: value}));
  }

  const handleSaveProduct = async () => {
    const url = isEditing 
      ? `${API_BASE_URL}/api/products/${currentProduct.id}`
      : `${API_BASE_URL}/api/products`;
    
    const method = isEditing ? 'PUT' : 'POST';

    const productData = {
        ...currentProduct,
        price: Number(currentProduct.price),
        stock: Number(currentProduct.stock)
    };

    try {
        const response = await fetch(url, {
            method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(productData)
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Error al guardar el producto');
        }
        setNotification({message: result.message, type: 'success'});
        fetchProducts(); // Refresh list
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
        setNotification({message: errorMessage, type: 'error'});
    } finally {
        handleDialogClose();
    }
  }

  // Delete handlers
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setConfirmOpen(true);
  };
  
  const handleConfirmClose = () => {
    setConfirmOpen(false);
    setProductToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productToDelete.id}`, { method: 'DELETE' });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Error al eliminar el producto');
        }
        setNotification({ message: result.message, type: 'success'});
        fetchProducts(); // Refresh list
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
        setNotification({ message: errorMessage, type: 'error'});
    } finally {
        handleConfirmClose();
    }
  };


  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {notification && <Notification {...notification} onClose={closeNotification} />}

      <Paper sx={{ p: 2, m: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Gestor de Productos
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
            Añadir Producto
          </Button>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <TableContainer>
          <Table stickyHeader aria-label="tabla de productos">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length > 0 ? products.map((product) => (
                <TableRow hover key={product.id}>
                  <TableCell component="th" scope="row">{product.name}</TableCell>
                  <TableCell sx={{maxWidth: '300px', whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>{product.description}</TableCell>
                  <TableCell align="right">${Number(product.price).toFixed(2)}</TableCell>
                  <TableCell align="right">{product.stock}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEditClick(product)} aria-label="editar">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(product)} aria-label="eliminar">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={5} align="center">
                        No hay productos en el catálogo.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto'}</DialogTitle>
        <DialogContent>
            <TextField autoFocus margin="dense" name="name" label="Nombre del Producto" type="text" fullWidth variant="standard" value={currentProduct.name} onChange={handleProductChange} />
            <TextField margin="dense" name="description" label="Descripción" type="text" fullWidth multiline rows={3} variant="standard" value={currentProduct.description} onChange={handleProductChange} />
            <TextField margin="dense" name="price" label="Precio" type="number" fullWidth variant="standard" value={currentProduct.price} onChange={handleProductChange} />
            <TextField margin="dense" name="stock" label="Stock" type="number" fullWidth variant="standard" value={currentProduct.stock} onChange={handleProductChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancelar</Button>
          <Button onClick={handleSaveProduct}>Guardar</Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <Dialog open={confirmOpen} onClose={handleConfirmClose}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar el producto "{productToDelete?.name}"? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductCatalog;
