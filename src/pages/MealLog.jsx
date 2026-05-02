import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { MealForm } from '../components/meals/MealForm';
import useAppStore from '../store/useAppStore';
import { useDailyNutrition } from '../hooks/useDailyNutrition';
import { formatDateKey, formatDisplayDate, formatTime } from '../utils/formatters';
import { MEAL_TYPES, HEALTH_BADGES } from '../utils/constants';

import './MealLog.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } }
};

const MealLog = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);

  const getMealsForDate = useAppStore((state) => state.getMealsForDate);
  const deleteMeal = useAppStore((state) => state.deleteMeal);
  const userProfile = useAppStore((state) => state.userProfile);

  const dateStr = formatDateKey(currentDate);
  const meals = getMealsForDate(dateStr);
  const totals = useDailyNutrition(meals);

  const handlePrevDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d); };
  const handleNextDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d); };
  const openAddModal  = () => { setEditingMeal(null); setIsModalOpen(true); };
  const openEditModal = (meal) => { setEditingMeal(meal); setIsModalOpen(true); };
  const handleDelete  = (mealId) => { if (window.confirm('Delete this meal?')) deleteMeal(mealId, dateStr); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="meal-log-page"
    >
      {/* Date Selector */}
      <div className="date-selector-row">
        <Button variant="ghost" onClick={handlePrevDay}><ChevronLeft size={20} /></Button>
        <h2 className="current-date-title">{formatDisplayDate(currentDate)}</h2>
        <Button variant="ghost" onClick={handleNextDay}><ChevronRight size={20} /></Button>
      </div>

      <div className="meal-log-grid">
        {/* Left Sidebar */}
        <div className="left-col">
          <Card className="summary-card">
            <CardHeader>
              <CardTitle>Daily Summary</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="summary-stats">
                {/* Calorie Block */}
                <div className="summary-calorie-block">
                  <span className="summary-cal-label">Calories</span>
                  <span className="summary-cal-value">{Math.round(totals.calories)}</span>
                  <span className="summary-cal-goal">/ {userProfile.calorieGoal || 2000} goal</span>
                </div>

                {/* Macro Grid */}
                <div className="summary-macros">
                  <div className="micro-stat protein">
                    <span className="micro-stat-label">Protein</span>
                    <span className="micro-stat-value">{Math.round(totals.protein)}g</span>
                  </div>
                  <div className="micro-stat carbs">
                    <span className="micro-stat-label">Carbs</span>
                    <span className="micro-stat-value">{Math.round(totals.carbs)}g</span>
                  </div>
                  <div className="micro-stat fat">
                    <span className="micro-stat-label">Fat</span>
                    <span className="micro-stat-value">{Math.round(totals.fat)}g</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="action-buttons-vertical">
            <Button variant="primary" fullWidth size="lg" onClick={openAddModal}>
              <Plus size={20} /> Log Meal
            </Button>
          </div>
        </div>

        {/* Right - Meals List */}
        <div className="right-col">
          <Card className="meals-list-card">
            <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CardTitle>Meals Logged</CardTitle>
              <Badge variant="neutral">{meals.length} item{meals.length !== 1 ? 's' : ''}</Badge>
            </CardHeader>
            <motion.div
              className="full-meals-list"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {meals.length === 0 ? (
                <motion.div variants={itemVariants} className="empty-state">
                  <span className="empty-icon">🍽️</span>
                  <h3>No meals logged</h3>
                  <p>Track your food to see a nutritional breakdown for the day.</p>
                  <Button variant="outline" onClick={openAddModal} style={{ marginTop: '0.5rem' }}>
                    <Plus size={16} /> Add First Meal
                  </Button>
                </motion.div>
              ) : (
                meals.map(meal => {
                  const mealTypeInfo = MEAL_TYPES.find(m => m.value === meal.type) || MEAL_TYPES[3];
                  const badgeInfo = HEALTH_BADGES[meal.healthBadge?.toLowerCase()];
                  const IconComp = mealTypeInfo.icon;

                  return (
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ scale: 1.01, x: 3 }}
                      key={meal.id}
                      className="meal-detail-item"
                    >
                      <div className="meal-icon-large" style={{ color: mealTypeInfo.color }}>
                        <IconComp size={32} strokeWidth={2.5} />
                      </div>
                      <div className="meal-info">
                        <div className="meal-header-main">
                          <h4>{meal.name}</h4>
                          <span className="meal-time-badge">{formatTime(meal.createdAt)}</span>
                        </div>

                        <div className="meal-macros-chips">
                          <Badge variant="neutral">{Math.round(meal.calories)} kcal</Badge>
                          {meal.protein ? <span className="macro-chip p">P: {Math.round(meal.protein)}g</span> : null}
                          {meal.carbs   ? <span className="macro-chip c">C: {Math.round(meal.carbs)}g</span>   : null}
                          {meal.fat     ? <span className="macro-chip f">F: {Math.round(meal.fat)}g</span>     : null}
                          {badgeInfo && (
                            <Badge className="ml-auto" style={{ backgroundColor: badgeInfo.bg, color: badgeInfo.color }}>
                              {badgeInfo.label}
                            </Badge>
                          )}
                        </div>

                        {meal.notes && <p className="meal-notes">{meal.notes}</p>}
                      </div>

                      <div className="meal-actions">
                        <button className="icon-btn edit-btn"   onClick={() => openEditModal(meal)}><Edit2 size={15} /></button>
                        <button className="icon-btn delete-btn" onClick={() => handleDelete(meal.id)}><Trash2 size={15} /></button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </Card>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMeal ? 'Edit Meal' : 'Add New Meal'}>
        <MealForm initialData={editingMeal} selectedDate={dateStr} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </motion.div>
  );
};

export default MealLog;
