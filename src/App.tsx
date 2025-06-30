import React, { useState } from 'react';
import ConfigForm from './features/global-config/ConfigForm';
import LiveMonitor from './features/live-monitor/LiveMonitor';
import ProductCatalog from './features/product-catalog/ProductCatalog';
import BotTrainer from './features/trainer/BotTrainer';
import ClientManager from './features/client-manager/ClientManager';
import { Box, Tab, Tabs, Typography, createTheme, ThemeProvider, CssBaseline } from '@mui/material/';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // indigo-500
    },
    background: {
      paper: '#1e293b', // slate-800
      default: '#0f172a', // slate-900
    },
    text: {
        primary: '#e2e8f0', // slate-200
        secondary: '#94a3b8', // slate-400
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', 
        }
      }
    }
  }
});


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`app-tabpanel-${index}`}
      aria-labelledby={`app-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `app-tab-${index}`,
    'aria-controls': `app-tabpanel-${index}`,
  };
}


const App: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-white">
            <header className="py-6 px-4 md:px-8 text-center">
                <h1 className="text-4xl font-bold text-white sm:text-5xl">
                    Panel de Administración del Chatbot
                </h1>
                <p className="mt-2 text-lg text-slate-300">
                    Una plataforma centralizada para gestionar y monitorear tu chatbot.
                </p>
            </header>
            <main className="w-full max-w-7xl mx-auto px-2">
                 <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="Módulos de administración" centered>
                        <Tab label="Configuración Global" {...a11yProps(0)} />
                        <Tab label="Monitor de Chats" {...a11yProps(1)} />
                        <Tab label="Catálogo de Productos" {...a11yProps(2)} />
                        <Tab label="Entrenador de IA" {...a11yProps(3)} />
                        <Tab label="Gestor de Clientes" {...a11yProps(4)} />
                    </Tabs>
                </Box>
                <TabPanel value={value} index={0}>
                    <div className="flex justify-center">
                        <div className="w-full max-w-2xl">
                             <ConfigForm />
                        </div>
                    </div>
                </TabPanel>
                <TabPanel value={value} index={1}>
                   <LiveMonitor />
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <ProductCatalog />
                </TabPanel>
                 <TabPanel value={value} index={3}>
                    <BotTrainer />
                </TabPanel>
                <TabPanel value={value} index={4}>
                    <ClientManager />
                </TabPanel>
            </main>
             <footer className="mt-12 py-6 text-center">
                <p className="text-sm text-slate-400">
                    &copy; {new Date().getFullYear()} Mi Chatbot Inc. Todos los derechos reservados.
                </p>
            </footer>
        </div>
    </ThemeProvider>
  );
};

export default App;