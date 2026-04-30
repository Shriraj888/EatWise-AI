import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import useAppStore from '../store/useAppStore';
import { validateProfile } from '../utils/validators';
import { calculateCalorieGoal, calculateMacroGoals } from '../utils/tdeeCalculator';
import { ACTIVITY_LEVELS, GOAL_TYPES, HEALTH_CONDITIONS } from '../utils/constants';
import toast from 'react-hot-toast';

import './Onboarding.css';

const Onboarding = ({ initialStep }) => {
  const [step, setStep] = useState(1);
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

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (errors[id]) setErrors({ ...errors, [id]: null });
    
    setFormData((prev) => ({
      ...prev,
      [id]: ['age', 'weight', 'height'].includes(id) ? Number(value) || '' : value,
    }));
  };



  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const { valid, errors: validationErrors } = validateProfile(formData);
    
    if (!valid) {
      setErrors(validationErrors);
      toast.error('Please fix the errors.');
      return;
    }

    const calorieGoal = calculateCalorieGoal(formData);
    const macroGoals = calculateMacroGoals(calorieGoal, formData.goal);

    setUserProfile({
      ...formData,
      calorieGoal,
      macroGoals,
    });
    
    toast.success('Profile created!');
  };



  return (
    <div className="onboarding-wrapper">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="profile-step"
            className="onboarding-step"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.4, type: 'spring' }}
          >
            <div className="onboarding-header text-center">
              <h1>Welcome to EatWise AI</h1>
              <p className="text-secondary">Let's set up your profile to generate personalized goals.</p>
            </div>
            <form onSubmit={handleProfileSubmit}>
              <Card className="floating-card">
                <CardHeader>
                  <CardTitle>Create Your Profile</CardTitle>
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
                      Any Health Conditions? <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', fontWeight: 400 }}>(optional, for better AI advice)</span>
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

                  <div className="form-actions mt-4">
                    <Button type="submit" variant="primary" fullWidth size="lg">
                      Start Using EatWise AI
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </form>
          </motion.div>
        )}


      </AnimatePresence>
    </div>
  );
};

Onboarding.propTypes = {
  initialStep: PropTypes.string,
};

export default Onboarding;
