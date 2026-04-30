import { useMutation } from '@tanstack/react-query';
import { generateRecipes } from '../services/openRouterService';
import toast from 'react-hot-toast';

export const useRecipeGeneration = () => {
  return useMutation({
    mutationFn: ({ ingredients, filters }) => generateRecipes(ingredients, filters),
    onSuccess: () => {
      toast.success('Recipes generated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate recipes.');
    },
  });
};
