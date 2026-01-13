import React, { useState } from 'react';
import { ClientProvider } from './context/ClientContext';
import { AppThemeProvider } from './theme/AppTheme';
import { MainLayout } from './components/Layout/MainLayout';

// Importamos los componentes de tus módulos
import ClientManager from './features/client-manager/ClientManager';
// Nota: Asegúrate de que la ruta sea correcta. Antes lo tenías en 'features/product-catalog'
import ProductCatalog from './features/product-catalog/ProductCatalog'; 
import BotTrainer from './features/trainer/BotTrainer';
import AppointmentManager from './features/appointment-manager/AppointmentManager';

const App: React.FC = () => {
  // Estado para controlar qué vista se muestra en el área principal
  // 0: Clientes, 1: Productos, 2: Entrenador, 3: Agenda
  const [activeTab, setActiveTab] = useState(0);

  // Función para decidir qué componente renderizar según el menú lateral
  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return <ClientManager />;
      case 1:
        // Pasamos null o props si es necesario, el componente maneja su estado
        return <ProductCatalog />; 
      case 2:
        return <BotTrainer />;
      case 3:
        return <AppointmentManager />;
      default:
        return <ClientManager />;
    }
  };

  return (
    // 1. Datos
    <ClientProvider>
      {/* 2. Tema Visual (Oscuro/Claro) */}
      <AppThemeProvider>
        {/* 3. Estructura Visual (Menú Lateral + Header) */}
        <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
          {/* 4. Contenido */}
          {renderContent()}
        </MainLayout>
      </AppThemeProvider>
    </ClientProvider>
  );
};

export default App;