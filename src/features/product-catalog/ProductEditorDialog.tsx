// File: src/features/product-catalog/ProductEditorDialog.tsx (Versión Simplificada)

import React, { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField 
} from '@mui/material';
import { Product } from '../../types/types';

interface ProductEditorDialogProps {
  open: boolean;
  onClose: () => void;
  // La prop onSave ahora espera recibir los datos del formulario
  onSave: (productData: Omit<Product, 'id'>) => void; 
  productToEdit?: Product;
}

const emptyProduct: Omit<Product, 'id'> = {
  name: '',
  description: '',
  price: '',
  stock: ''
};

const ProductEditorDialog: React.FC<ProductEditorDialogProps> = ({ open, onClose, onSave, productToEdit }) => {
  const [formData, setFormData] = useState(emptyProduct);
  const isEditing = !!productToEdit;

  useEffect(() => {
    if (open) {
      setFormData(isEditing ? productToEdit : emptyProduct);
    }
  }, [productToEdit, isEditing, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Esta función ya no es async y no hace llamadas a la API.
  // Simplemente pasa los datos del formulario al componente padre.
  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto'}</DialogTitle>
      <DialogContent>
        <TextField autoFocus required margin="dense" name="name" label="Nombre del Producto" type="text" fullWidth variant="standard" value={formData.name} onChange={handleChange} />
        <TextField required margin="dense" name="description" label="Descripción" type="text" fullWidth multiline rows={3} variant="standard" value={formData.description} onChange={handleChange} />
        <TextField required margin="dense" name="price" label="Precio" type="number" fullWidth variant="standard" value={formData.price} onChange={handleChange} />
        <TextField required margin="dense" name="stock" label="Stock" type="number" fullWidth variant="standard" value={formData.stock} onChange={handleChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductEditorDialog;