import { useQuery } from '@tanstack/react-query';
import { searchFood, getProductByBarcode } from '../services/foodFactsService';

export const useFoodSearch = (query) => {
  return useQuery({
    queryKey: ['foodSearch', query],
    queryFn: () => searchFood(query),
    enabled: !!query,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useBarcodeLookup = (barcode) => {
  return useQuery({
    queryKey: ['barcodeLookup', barcode],
    queryFn: () => getProductByBarcode(barcode),
    enabled: !!barcode,
    staleTime: 1000 * 60 * 60, // 1 hour (barcodes don't change often)
  });
};
