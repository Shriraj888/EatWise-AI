import { useMutation } from '@tanstack/react-query';
import { analyzeMeal } from '../services/geminiService';
import toast from 'react-hot-toast';

export const useAIAnalysis = () => {
  return useMutation({
    mutationFn: (input) => analyzeMeal(input),
    onSuccess: () => {
      toast.success('Meal analyzed successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to analyze meal.');
    },
  });
};
