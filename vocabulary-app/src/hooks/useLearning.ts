import { useContext } from 'react';
import { LearningContext } from '../contexts/LearningContext';

export const useLearning = () => {
  const context = useContext(LearningContext);
  
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  
  return context;
}; 