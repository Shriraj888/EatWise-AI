import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import useAppStore from '../store/useAppStore';
import { validateProfile } from '../utils/validators';
import { calculateCalorieGoal, calculateMacroGoals } from '../utils/tdeeCalculator';
import { ACTIVITY_LEVELS, GOAL_TYPES, HEALTH_CONDITIONS } from '../utils/constants';

import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const userProfile = useAppStore((state) => state.userProfile);
  const setUserProfile = useAppStore((state) => state.setUserProfile);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    activity: 'moderate',
    goal: 'maintain',
    healthConditions: [],
  });



  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Populate form with existing data if present
    if (userProfile.name) {
      setFormData({
        name: userProfile.name,
        age: userProfile.age || '',
        weight: userProfile.weight || '',
        height: userProfile.height || '',
        gender: userProfile.gender || 'male',
        activity: userProfile.activity || 'moderate',
        goal: userProfile.goal || 'maintain',
        healthConditions: userProfile.healthConditions || [],
      });
    }
  }, [userProfile]);



  const handleChange = (e) => {
    const { id, value } = e.target;
    // Clear error when user types
    if (errors[id]) setErrors({ ...errors, [id]: null });
    
    setFormData((prev) => ({
      ...prev,
      [id]: ['age', 'weight', 'height'].includes(id) ? Number(value) || '' : value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    const { valid, errors: validationErrors } = validateProfile(formData);
    
    if (!valid) {
      setErrors(validationErrors);
      toast.error('Please fix the errors in the form.');
      return;
    }

    // Calculate goals
    const calorieGoal = calculateCalorieGoal({
      weight: formData.weight,
      height: formData.height,
      age: formData.age,
      gender: formData.gender,
      activity: formData.activity,
      goal: formData.goal,
    });

    const macroGoals = calculateMacroGoals(calorieGoal, formData.goal);

    // Save to store
    setUserProfile({
      ...formData,
      calorieGoal,
      macroGoals,
    });

    toast.success('Profile and goals saved successfully!');
    navigate('/');
  };



  const isComplete = !!userProfile.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="profile-page"
    >
      <div className="profile-header">
        <h1>{isComplete ? 'Your Profile' : 'Welcome to EatWise AI'}</h1>
        <p className="text-secondary">
          {isComplete 
            ? 'Update your details to recalculate your nutritional goals.' 
            : 'Let’s set up your profile to generate personalized health goals.'}
        </p>
      </div>

      <div className="profile-content">
        <form onSubmit={handleSave}>
          <Card className="profile-card">
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardBody className="form-grid">
              <Input
                id="name"
                label="First Name"
                placeholder="e.g., Alex"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
              />
              
              <div className="input-row">
                <Input
                  id="age"
                  type="number"
                  label="Age"
                  placeholder="Years"
                  value={formData.age}
                  onChange={handleChange}
                  error={errors.age}
                />
                <Select
                  id="gender"
                  label="Gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                  ]}
                />
              </div>

              <div className="input-row">
                <Input
                  id="weight"
                  type="number"
                  label="Weight (kg)"
                  placeholder="kg"
                  value={formData.weight}
                  onChange={handleChange}
                  error={errors.weight}
                />
                <Input
                  id="height"
                  type="number"
                  label="Height (cm)"
                  placeholder="cm"
                  value={formData.height}
                  onChange={handleChange}
                  error={errors.height}
                />
              </div>

              <Select
                id="activity"
                label="Activity Level"
                value={formData.activity}
                onChange={handleChange}
                options={ACTIVITY_LEVELS}
                error={errors.activity}
              />

              <Select
                id="goal"
                label="Primary Goal"
                value={formData.goal}
                onChange={handleChange}
                options={GOAL_TYPES}
                error={errors.goal}
              />

              {/* Health Conditions (SDG 3) */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)' }}>
                  Health Conditions <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', fontWeight: 400 }}>(SDG 3 — for personalized AI advice)</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {HEALTH_CONDITIONS.map((condition) => {
                    const isSelected = formData.healthConditions.includes(condition.value);
                    return (
                      <button
                        key={condition.value}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? formData.healthConditions.filter(c => c !== condition.value)
                            : condition.value === 'none'
                              ? ['none']
                              : [...formData.healthConditions.filter(c => c !== 'none'), condition.value];
                          setFormData(prev => ({ ...prev, healthConditions: updated }));
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          padding: 'var(--space-2) var(--space-3)',
                          borderRadius: 'var(--radius-full)',
                          border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          background: isSelected ? 'var(--color-primary-bg)' : 'var(--color-bg-secondary)',
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: isSelected ? 600 : 400,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span>{condition.icon}</span>
                        <span>{condition.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-actions">
                <Button type="submit" variant="primary" fullWidth size="lg">
                  {isComplete ? 'Save Changes' : 'Generate My plan'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </form>

        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Card className="goals-card">
              <CardHeader>
                <CardTitle>Your Daily Targets</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="goals-calorie-block">
                  <span className="goals-calorie-label">Daily Calories</span>
                  <span className="goals-calorie-value">{userProfile.calorieGoal} kcal</span>
                </div>

                <div className="macros-grid">
                  <div className="macro-stat protein">
                    <span className="macro-label">Protein</span>
                    <span className="macro-value">{userProfile.macroGoals?.protein}g</span>
                  </div>
                  <div className="macro-stat carbs">
                    <span className="macro-label">Carbs</span>
                    <span className="macro-value">{userProfile.macroGoals?.carbs}g</span>
                  </div>
                  <div className="macro-stat fat">
                    <span className="macro-label">Fat</span>
                    <span className="macro-value">{userProfile.macroGoals?.fat}g</span>
                  </div>
                </div>
                <p className="goals-note">
                  Calculated via the Mifflin-St Jeor formula based on your profile.
                </p>
              </CardBody>
            </Card>
          </motion.div>
        )}


      </div>
    </motion.div>
  );
};

export default Profile;
