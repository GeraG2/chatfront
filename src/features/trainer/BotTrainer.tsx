import React, { useState } from 'react';
import { Grid, Box } from '@mui/material/';
import PromptEditor from './PromptEditor';
import SandboxChat from './SandboxChat';

const BotTrainer: React.FC = () => {
  const [systemInstruction, setSystemInstruction] = useState<string>('');

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2} sx={{ height: { md: 'calc(100vh - 320px)' }, minHeight: '600px' }}>
        <Grid item xs={12} md={5} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <PromptEditor 
            instruction={systemInstruction}
            onInstructionChange={setSystemInstruction}
          />
        </Grid>
        <Grid item xs={12} md={7} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <SandboxChat systemInstruction={systemInstruction} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BotTrainer;
