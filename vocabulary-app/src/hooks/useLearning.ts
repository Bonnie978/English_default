import { useContext } from 'react';
import { LearningContext } from '../contexts/LearningContext';

export const useLearning = () => {
  return useContext(LearningContext);
}; 