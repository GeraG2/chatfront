// File: src/features/product-catalog/ProductCatalog.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, Paper, Typography, Button, CircularProgress, Alert, 
    Table, TableContainer, TableHead, TableRow, TableCell, TableBody, IconButton,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useClientContext } from '../../context/ClientContext';
import { API_BASE_URL } from '../../constants';
import { Product } from '../../types/types';
import ProductEditorDialog from './ProductEditorDialog';

// Define las props que el componente aceptará
interface ProductCatalogProps {
  clientId: string;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ clientId }) => {
  useEffect(() => {
    if (clientId) {
      fetch(`/api/clients/${clientId}/products`);
    }
  }, [clientId]);
  const { activeClientId } = useClientContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | undefined>(undefined);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!activeClientId) {
      setProducts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients/${activeClientId}/products`);
      if (!response.ok) throw new Error('Error al cargar productos.');
      setProducts(await response.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [activeClientId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  const handleOpenEditor = (product?: Product) => {
    setProductToEdit(product);
    setIsEditorOpen(true);
  };
  
  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setProductToEdit(undefined);
  };
  
  const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
    if (!activeClientId) return;
    
    const isEditing = !!productToEdit;
    const url = isEditing
      ? `${API_BASE_URL}/api/clients/${activeClientId}/products/${productToEdit!.id}`
      : `${API_BASE_URL}/api/clients/${activeClientId}/products`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el producto.');
      }
      fetchProducts();
      handleCloseEditor();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al guardar');
    }
  };

  // --- LÓGICA DE BORRADO CORREGIDA ---

  // 1. Esta función solo abre el diálogo
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsConfirmOpen(true);
  };

  // 2. Esta función solo cierra el diálogo
  const handleCloseDeleteDialog = () => {
    setProductToDelete(null);
    setIsConfirmOpen(false);
  };

  // 3. Esta función, llamada por el botón del diálogo, hace el trabajo real
  const handleConfirmDelete = async () => {
    if (!activeClientId || !productToDelete) return;

    try {
      await fetch(`${API_BASE_URL}/api/clients/${activeClientId}/products/${productToDelete.id}`, { method: 'DELETE' });
      // Tras el éxito, refrescamos la lista
      fetchProducts(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al eliminar');
    } finally {
      // Y siempre cerramos el diálogo
      handleCloseDeleteDialog();
    }
  };
  
  if (!activeClientId) {
    return <Paper sx={{p: 3, textAlign: 'center'}}><Typography>Selecciona un cliente para gestionar su catálogo.</Typography></Paper>;
  }

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">Catálogo del Cliente</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenEditor()}>
            Añadir Producto
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
        
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell align="right">Precio</TableCell>
                        <TableCell align="right">Stock</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {products.map((product) => (
                    <TableRow key={product.id} hover>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.description}</TableCell>
                        <TableCell align="right">${Number(product.price).toFixed(2)}</TableCell>
                        <TableCell align="right">{product.stock}</TableCell>
                        <TableCell align="right">
                            <IconButton onClick={() => handleOpenEditor(product)} aria-label="editar"><EditIcon /></IconButton>
                            {/* El botón ahora llama a handleDeleteClick */}
                            <IconButton onClick={() => handleDeleteClick(product)} aria-label="eliminar" color="error"><DeleteIcon /></IconButton>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
      </Box>
      
      {isEditorOpen &&
        <ProductEditorDialog
            open={isEditorOpen}
            onClose={handleCloseEditor}
            onSave={handleSaveProduct}
            productToEdit={productToEdit}
        />
      }
      
      <Dialog open={isConfirmOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar el producto **"{productToDelete?.name}"**?
            <br/>Esta acción es permanente.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          {/* El botón de confirmación ahora llama a handleConfirmDelete */}
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Sí, Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductCatalog;