import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EssayHistoryDashboard from './components/EssayHistoryDashboard';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            에세이 채점 시스템
          </Typography>
          <Button color="inherit" component={Link} to="/">
            홈
          </Button>
          <Button color="inherit" component={Link} to="/history">
            히스토리
          </Button>
        </Toolbar>
      </AppBar>
      <Container>
        <Routes>
          <Route path="/history" element={<EssayHistoryDashboard />} />
          <Route path="/" element={<div>홈페이지</div>} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App; 