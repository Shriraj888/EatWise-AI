import React, { useState, useEffect } from 'react';
import { useFoodSearch } from '../../hooks/useFoodSearch';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { MEAL_TYPES } from '../../utils/constants';
import { validateMeal } from '../../utils/validators';
import { Search, Plus } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import toast from 'react-hot-toast';

export const MealForm = ({ initialData, selectedDate, onClose }) => {
  const addMeal = useAppStore((state) => state.addMeal);
  const updateMeal = useAppStore((state) => state.updateMeal);

  const [formData, setFormData] = useState({
    name: '',
    type: 'breakfast',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    notes: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { data: searchResults, isLoading: isSearchLoading } = useFoodSearch(searchQuery);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Debounce search query
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        setDebouncedSearch(searchQuery);
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (errors[id]) setErrors({ ...errors, [id]: null });
    setFormData((prev) => ({
      ...prev,
      [id]: ['calories', 'protein', 'carbs', 'fat'].includes(id) 
        ? (value === '' ? '' : Number(value)) 
        : value,
    }));
  };

  const handleSelectFood = (food) => {
    setFormData({
      ...formData,
      name: food.name,
      calories: food.nutrition.calories || '',
      protein: food.nutrition.protein || '',
      carbs: food.nutrition.carbs || '',
      fat: food.nutrition.fat || '',
    });
    setSearchQuery('');
    setShowResults(false);
    toast.success('Nutrition info autofilled!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { valid, errors: validationErrors } = validateMeal(formData);
    
    if (!valid) {
      setErrors(validationErrors);
      return;
    }

    if (initialData?.id) {
      updateMeal(initialData.id, formData, selectedDate);
      toast.success('Meal updated!');
    } else {
      addMeal(formData, selectedDate);
      toast.success('Meal logged successfully!');
    }
    
    onClose();
  };

  return (
    <div className="meal-form-container">
      {/* Food Search Section */}
      <div className="search-section" style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Input
          id="search"
          placeholder="Search Open Food Facts database..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={Search}
        />
        
        {showResults && debouncedSearch && (
          <div className="search-results" style={{
            position: 'absolute', top: '100%', left: 0, right: 0, 
            background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', zIndex: 10, maxHeight: '200px', overflowY: 'auto',
            boxShadow: 'var(--shadow-md)', marginTop: '4px'
          }}>
            {isSearchLoading ? (
              <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>Searching...</div>
            ) : searchResults && searchResults.length > 0 ? (
              searchResults.map((food) => (
                <div 
                  key={food.id} 
                  style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid var(--color-border)' }}
                  onClick={() => handleSelectFood(food)}
                  className="search-result-item"
                >
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{food.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {food.nutrition.calories} kcal
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>No results found</div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          id="name"
          label="Meal Name*"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />

        <Select
          id="type"
          label="Meal Type*"
          value={formData.type}
          onChange={handleChange}
          options={MEAL_TYPES}
          error={errors.type}
        />

        <Input
          id="calories"
          type="number"
          label="Calories (kcal)*"
          value={formData.calories}
          onChange={handleChange}
          error={errors.calories}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
          <Input
            id="protein"
            type="number"
            label="Protein (g)"
            value={formData.protein}
            onChange={handleChange}
            error={errors.protein}
          />
          <Input
            id="carbs"
            type="number"
            label="Carbs (g)"
            value={formData.carbs}
            onChange={handleChange}
            error={errors.carbs}
          />
          <Input
            id="fat"
            type="number"
            label="Fat (g)"
            value={formData.fat}
            onChange={handleChange}
            error={errors.fat}
          />
        </div>

        <Input
          id="notes"
          label="Notes (Optional)"
          value={formData.notes}
          onChange={handleChange}
        />

        <Button type="submit" variant="primary" fullWidth style={{ marginTop: '0.5rem' }}>
          {initialData ? 'Update Meal' : 'Save Meal'}
        </Button>
      </form>
    </div>
  );
};
