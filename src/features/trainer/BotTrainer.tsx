// File: src/features/trainer/BotTrainer.tsx (Versión Final con Contexto)

import React, { useState, useEffect } from 'react';
import { Grid, Box } from '@mui/material/';
import PromptEditor from './PromptEditor';
import SandboxChat from './SandboxChat';
import { useClientContext } from '../../context/ClientContext'; // 1. Importamos el hook del contexto

const BotTrainer: React.FC = () => {
  // 2. Obtenemos los datos del contexto global
  const { clients, activeClientId } = useClientContext();

  // 3. Este estado ahora guardará la instrucción del cliente activo, lista para ser editada
  const [instructionForEditing, setInstructionForEditing] = useState<string>('');

  // 4. Este useEffect es la magia: se activa cuando el cliente activo cambia
  useEffect(() => {
    // Si tenemos un cliente activo seleccionado...
    if (activeClientId) {
      // Usamos .find() para buscar en el array 'clients' el objeto
      // cuyo 'clientId' coincida con el cliente activo.
      const currentClient = clients.find(client => client.clientId === activeClientId);
    
     // Si encontramos al cliente...
      if (currentClient) {
        // Cargamos su 'systemInstruction' en el estado del editor.
        setInstructionForEditing(currentClient.systemInstruction);
      }
    } else {
    // Si no hay ningún cliente seleccionado, mostramos un mensaje por defecto.
    setInstructionForEditing('Por favor, selecciona un "Cliente Activo" en el menú superior para empezar a entrenar.');
    }
  }, [activeClientId, clients]); // El efecto se dispara cada vez que cambia el cliente activo o la lista de clientes.

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2} sx={{ height: { md: 'calc(100vh - 240px)' }, minHeight: '600px' }}>
        <Grid item xs={12} md={5} sx={{ height: '100%', display: 'flex' }}>
          {/* Le pasamos la instrucción y la función para actualizarla */}
          <PromptEditor 
            instruction={instructionForEditing}
            onInstructionChange={setInstructionForEditing}
          />
        </Grid>
        <Grid item xs={12} md={7} sx={{ height: '100%', display: 'flex' }}>
          {/* El sandbox siempre usará la versión más reciente del texto del editor */}
          <SandboxChat systemInstruction={instructionForEditing} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BotTrainer;