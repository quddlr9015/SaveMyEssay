import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

interface EssayHistory {
  id: number;
  testName: string;
  testLevel: string;
  question: string;
  essay: string;
  score: number;
  feedback: string;
  grammar: string[];
  vocabulary: string[];
  content: string[];
  organization: string[];
  createdAt: string;
}

const EssayHistoryDashboard: React.FC = () => {
  const [histories, setHistories] = useState<EssayHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/essay_grader/history`, {
          withCredentials: true,
        });
        setHistories(response.data);
      } catch (error) {
        console.error('Error fetching essay histories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistories();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        에세이 채점 히스토리
      </Typography>
      <Grid container spacing={3}>
        {histories.map((history) => (
          <Grid item xs={12} key={history.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6">
                      {history.testName} - {history.testLevel}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      {new Date(history.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={`점수: ${history.score}`}
                    color={history.score >= 80 ? 'success' : history.score >= 60 ? 'warning' : 'error'}
                  />
                </Box>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>문제</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>{history.question}</Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>에세이 내용</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography style={{ whiteSpace: 'pre-wrap' }}>{history.essay}</Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>전체 피드백</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>{history.feedback}</Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>상세 피드백</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom>
                          문법 피드백
                        </Typography>
                        <ul>
                          {history.grammar.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom>
                          어휘 피드백
                        </Typography>
                        <ul>
                          {history.vocabulary.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom>
                          내용 피드백
                        </Typography>
                        <ul>
                          {history.content.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom>
                          구성 피드백
                        </Typography>
                        <ul>
                          {history.organization.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EssayHistoryDashboard; 