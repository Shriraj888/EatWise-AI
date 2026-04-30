import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Heart, Plus, Clock, Flame, ChefHat } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useRecipeGeneration } from '../hooks/useRecipeGeneration';
import useAppStore from '../store/useAppStore';
import { DIET_FILTERS } from '../utils/constants';
import toast from 'react-hot-toast';

import './RecipeSuggester.css';

const RecipeSuggester = () => {
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  
  const { mutate: generateRecipes, data: generatedRecipes, isPending } = useRecipeGeneration();
  
  const addFavorite = useAppStore(state => state.addFavorite);
  const removeFavorite = useAppStore(state => state.removeFavorite);
  const isFavorite = useAppStore(state => state.isFavorite);
  const favorites = useAppStore(state => state.favorites);
  
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' | 'favorites'

  const handleAddIngredient = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !ingredients.includes(val)) {
        if (ingredients.length >= 10) {
          toast.error('Maximum 10 ingredients allowed');
          return;
        }
        setIngredients([...ingredients, val]);
        setInputValue('');
      }
    }
  };

  const removeIngredient = (ing) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const toggleFilter = (filter) => {
    setActiveFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const handleGenerate = () => {
    if (ingredients.length === 0) {
      toast.error('Please add at least one ingredient');
      return;
    }
    generateRecipes({ ingredients, filters: activeFilters });
  };

  const toggleFavorite = (recipe) => {
    if (isFavorite(recipe.name)) {
      const existing = favorites.find(f => f.name === recipe.name);
      if (existing) removeFavorite(existing.id);
      toast.success('Removed from favorites');
    } else {
      addFavorite(recipe);
      toast.success('Added to favorites!');
    }
  };

  const renderRecipeCard = (recipe, index) => {
    const isFav = isFavorite(recipe.name);
    
    return (
      <motion.div
        key={recipe.id || index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card className="recipe-card">
          <CardHeader>
            <CardTitle>{recipe.name}</CardTitle>
            <button 
              className={`fav-btn ${isFav ? 'is-fav' : ''}`}
              onClick={() => toggleFavorite(recipe)}
            >
              <Heart size={20} fill={isFav ? "currentColor" : "none"} />
            </button>
          </CardHeader>
          <CardBody>
            <div className="recipe-meta">
              <div className="meta-item">
                <Clock size={16} />
                <span>{recipe.prepTime} prep · {recipe.cookTime} cook</span>
              </div>
              <div className="meta-item">
                <Flame size={16} />
                <span className="difficulty-badge" data-diff={recipe.difficulty}>{recipe.difficulty}</span>
              </div>
            </div>

            <div className="recipe-macros-bar">
              <div className="r-macro"><strong>{recipe.nutrition?.calories || 0}</strong> kcal</div>
              <div className="r-macro p"><strong>{recipe.nutrition?.protein || 0}g</strong> P</div>
              <div className="r-macro c"><strong>{recipe.nutrition?.carbs || 0}g</strong> C</div>
              <div className="r-macro f"><strong>{recipe.nutrition?.fat || 0}g</strong> F</div>
            </div>

            <div className="recipe-content-grid">
              <div className="r-ingredients">
                <h4>Ingredients</h4>
                <ul>
                  {recipe.ingredients?.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>
              <div className="r-steps">
                <h4>Instructions</h4>
                <ol>
                  {recipe.steps?.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            {recipe.healthBenefits && (
              <div style={{
                background: 'var(--color-primary-bg)',
                border: '1px solid rgba(16, 185, 129, 0.12)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
                marginTop: 'var(--space-3)',
                display: 'flex',
                gap: 'var(--space-2)',
                alignItems: 'flex-start',
              }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}>🌍</span>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  <strong style={{ color: 'var(--color-primary)' }}>SDG 3: </strong>
                  {recipe.healthBenefits}
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    );
  };

  return (
    <motion.div 
      className="recipe-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="recipe-header">
        <h1>Recipe Suggester</h1>
        <p className="text-secondary">Turn your ingredients into healthy, delicious meals with AI.</p>
        
        <div className="recipe-tabs">
          <button 
            className={`tab-btn ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            Generate
          </button>
          <button 
            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            Favorites ({favorites.length})
          </button>
        </div>
      </div>

      {activeTab === 'generate' ? (
        <div className="generate-view">
          <div className="input-panel">
            <Card>
              <CardHeader><CardTitle>What's in your fridge?</CardTitle></CardHeader>
              <CardBody>
                <div className="ingredient-input-wrapper">
                  <Input
                    placeholder="E.g., chicken, rice, broccoli"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleAddIngredient}
                  />
                  <Button variant="secondary" onClick={handleAddIngredient}><Plus size={16} /> Add</Button>
                </div>

                <div className="ingredients-tags">
                  <AnimatePresence>
                    {ingredients.map((ing) => (
                      <motion.div
                        key={ing}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="ingredient-tag"
                      >
                        {ing}
                        <button onClick={() => removeIngredient(ing)}><X size={14} /></button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {ingredients.length === 0 && (
                    <span className="no-ingredients-text">Add ingredients to get started</span>
                  )}
                </div>

                <div className="filters-section">
                  <h4>Dietary Filters</h4>
                  <div className="filters-grid">
                    {DIET_FILTERS.map((filter) => (
                      <button
                        key={filter.value}
                        className={`filter-chip ${activeFilters.includes(filter.value) ? 'active' : ''}`}
                        onClick={() => toggleFilter(filter.value)}
                      >
                        {filter.icon} {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  fullWidth 
                  size="lg" 
                  onClick={handleGenerate}
                  isLoading={isPending}
                  className="generate-btn"
                >
                  <ChefHat size={18} /> Generate Recipes
                </Button>
              </CardBody>
            </Card>
          </div>

          <div className="results-panel">
            {isPending ? (
              <div className="generating-state">
                <ChefHat size={48} className="bouncing-icon" />
                <h3>Cooking up ideas...</h3>
                <p>Asking the AI chef for recipes based on your ingredients.</p>
              </div>
            ) : generatedRecipes && generatedRecipes.length > 0 ? (
              <div className="recipes-list">
                {generatedRecipes.map((recipe, idx) => renderRecipeCard(recipe, idx))}
              </div>
            ) : (
              <div className="waiting-state">
                <Search size={48} className="empty-icon" />
                <h3>Ready to cook</h3>
                <p>Add ingredients and select filters on the left to see recipe suggestions here.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="favorites-view">
          {favorites.length === 0 ? (
            <div className="empty-favorites">
              <Heart size={48} className="empty-icon" />
              <h3>No favorites yet</h3>
              <p>Generate some recipes and click the heart icon to save them here.</p>
              <Button onClick={() => setActiveTab('generate')} variant="outline">Go Generate</Button>
            </div>
          ) : (
            <div className="recipes-grid">
              {favorites.map((recipe, idx) => renderRecipeCard(recipe, idx))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default RecipeSuggester;
