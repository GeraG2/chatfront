import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Box, CircularProgress, Typography, Alert } from '@mui/material/';
import ChatList from './ChatList';
import ChatTranscript from './ChatTranscript';
import AdminToolkit from './AdminToolkit';
import { API_BASE_URL_MONITOR } from '../../constants';
import { SessionData, SessionListItem } from '../../types';

const LiveMonitor: React.FC = () => {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionListItem | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    // Keep loading state true only on first load
    // Subsequent polls will be silent
    if (isLoadingList) setIsLoadingList(true);
    try {
      const response = await fetch(`${API_BASE_URL_MONITOR}/api/sessions`);
      if (!response.ok) {
        throw new Error(`Error al obtener sesiones: ${response.statusText}`);
      }
      const data: SessionListItem[] = await response.json();
      setSessions(data);
      // If a selected session is no longer active, deselect it
      if (selectedSession && !data.find(s => s.id === selectedSession.id && s.platform === selectedSession.platform)) {
        setSelectedSession(null);
        setSessionData(null);
      }
      setError(null);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
      console.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoadingList(false);
    }
  }, [isLoadingList, selectedSession]);

  useEffect(() => {
    fetchSessions();
    const intervalId = setInterval(fetchSessions, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [fetchSessions]);

  const fetchSessionData = useCallback(async (session: SessionListItem) => {
    if (!session) return;
    setIsLoadingSession(true);
    setSessionData(null);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL_MONITOR}/api/sessions/${session.platform}/${session.id}`);
      if (!response.ok) {
        throw new Error(`Error al obtener los datos de la sesión: ${response.statusText}`);
      }
      const data: SessionData = await response.json();
      setSessionData(data);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
      console.error(errorMessage);
      setError(errorMessage);
      setSessionData(null);
    } finally {
      setIsLoadingSession(false);
    }
  }, []);

  const handleSelectSession = useCallback((session: SessionListItem) => {
    setSelectedSession(session);
    fetchSessionData(session);
  }, [fetchSessionData]);
  
  const handleInstructionUpdate = useCallback(() => {
      if (selectedSession) {
          fetchSessionData(selectedSession);
      }
  }, [selectedSession, fetchSessionData]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {error && !isLoadingList && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2} sx={{ height: { md: 'calc(100vh - 320px)' }, minHeight: '500px' }}>
        <Grid item xs={12} md={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom component="div" sx={{ px: 2, pt: 1 }}>
            Chats Activos
          </Typography>
          {isLoadingList ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <ChatList 
              sessions={sessions} 
              selectedSession={selectedSession}
              onSelectSession={handleSelectSession} 
            />
          )}
        </Grid>
        <Grid item xs={12} md={6} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <ChatTranscript 
                history={sessionData?.history} 
                isLoading={isLoadingSession}
            />
        </Grid>
        <Grid item xs={12} md={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <AdminToolkit
                sessionId={selectedSession?.id || null}
                platform={selectedSession?.platform}
                initialInstruction={sessionData?.systemInstruction}
                isLoading={isLoadingSession}
                onInstructionUpdate={handleInstructionUpdate}
            />
        </Grid>
      </Grid>
    </Box>
  );
};

export default LiveMonitor;