import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, FileText, CheckCircle2, ArrowRight, ScanLine } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import useAppStore from '../store/useAppStore';
import { HEALTH_BADGES } from '../utils/constants';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import './AIAnalyzer.css';

const AIAnalyzer = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [mode, setMode] = useState('image'); // 'image' | 'text'
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const { mutate: analyze, data: analysisResult, isPending, reset } = useAIAnalysis();
  const addMeal = useAppStore(state => state.addMeal);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      
      // Reset previous results
      reset();
    }
  };

  const handleAnalyze = () => {
    if (mode === 'image') {
      if (!selectedImage) {
        toast.error('Please select an image first');
        return;
      }
      analyze(selectedImage);
    } else {
      if (!inputText.trim()) {
        toast.error('Please describe your meal first');
        return;
      }
      analyze(inputText);
    }
  };

  const handleAddToLog = () => {
    if (!analysisResult) return;
    
    addMeal({
      name: analysisResult.name,
      type: 'dinner', // default to dinner, user can edit later
      calories: analysisResult.calories,
      protein: analysisResult.macros?.protein,
      carbs: analysisResult.macros?.carbs,
      fat: analysisResult.macros?.fat,
      healthBadge: analysisResult.badge,
      notes: 'Logged via AI Analyzer'
    });
    
    toast.success('Added to your meal log!');
    navigate('/meals');
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setInputText('');
    reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="analyzer-page"
    >
      <div className="analyzer-header">
        <h1>AI Meal Analyzer</h1>
        <p className="text-secondary">Scan a photo or describe your meal to get a full nutritional breakdown.</p>
      </div>

      <div className="analyzer-content">
        {/* Left Side - Input */}
        <div className="analyzer-input-section">
          <Card className="input-card">
            <CardHeader className="mode-toggle-header">
              <div className="mode-toggle">
                <button 
                  className={`mode-btn ${mode === 'image' ? 'active' : ''}`}
                  onClick={() => setMode('image')}
                >
                  <Camera size={18} /> Image
                </button>
                <button 
                  className={`mode-btn ${mode === 'text' ? 'active' : ''}`}
                  onClick={() => setMode('text')}
                >
                  <FileText size={18} /> Text
                </button>
              </div>
            </CardHeader>
            <CardBody>
              {mode === 'image' ? (
                <div className="image-upload-container">
                  {imagePreview ? (
                    <div className="image-preview-wrapper">
                      <img src={imagePreview} alt="Meal preview" className="image-preview" />
                      <button className="clear-image-btn" onClick={clearSelection}>Change Image</button>
                    </div>
                  ) : (
                    <div 
                      className="upload-dropzone"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={40} className="upload-icon" />
                      <h3>Upload Meal Photo</h3>
                      <p>Click or drag & drop an image</p>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageSelect} 
                        accept="image/*" 
                        style={{ display: 'none' }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-input-container">
                  <textarea
                    className="meal-textarea"
                    placeholder="Describe your meal (e.g., '1 cup of white rice, 200g grilled chicken breast, and steamed broccoli')"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={6}
                  />
                  {inputText && (
                    <button className="clear-text-btn" onClick={clearSelection}>Clear Text</button>
                  )}
                </div>
              )}

              <Button 
                variant="primary" 
                fullWidth 
                size="lg" 
                className="analyze-btn" 
                onClick={handleAnalyze}
                isLoading={isPending}
                disabled={mode === 'image' ? !selectedImage : !inputText.trim()}
              >
                Analyze Nutrition
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Right Side - Results */}
        <div className="analyzer-result-section">
          <AnimatePresence mode="wait">
            {isPending ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="analyzing-state"
              >
                <div className="scanning-animation">
                  <div className="scan-line"></div>
                </div>
                <h3>AI is analyzing...</h3>
                <p>Estimating calories and macros</p>
              </motion.div>
            ) : analysisResult ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="result-card">
                  <CardHeader>
                    <CardTitle>{analysisResult.name}</CardTitle>
                    {analysisResult.badge && (
                      <Badge style={{
                        backgroundColor: HEALTH_BADGES[analysisResult.badge.toLowerCase()]?.bg,
                        color: HEALTH_BADGES[analysisResult.badge.toLowerCase()]?.color
                      }}>
                        {analysisResult.badge}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardBody>
                    <div className="score-ring-container">
                      <div className="score-ring">
                        <span className="score-value">{analysisResult.score}<small>/10</small></span>
                        <span className="score-label">Health Score</span>
                      </div>
                    </div>

                    <div className="nutrition-breakdown">
                      <div className="nutrition-item cal">
                        <span className="nut-value">{analysisResult.calories}</span>
                        <span className="nut-label">Calories</span>
                      </div>
                      <div className="nutrition-item pro">
                        <span className="nut-value">{analysisResult.macros?.protein}g</span>
                        <span className="nut-label">Protein</span>
                      </div>
                      <div className="nutrition-item carb">
                        <span className="nut-value">{analysisResult.macros?.carbs}g</span>
                        <span className="nut-label">Carbs</span>
                      </div>
                      <div className="nutrition-item fat">
                        <span className="nut-value">{analysisResult.macros?.fat}g</span>
                        <span className="nut-label">Fat</span>
                      </div>
                    </div>

                    <div className="suggestions-list">
                      <h4>AI Suggestions</h4>
                      <ul>
                        {analysisResult.suggestions?.map((sug, i) => (
                          <li key={i}><CheckCircle2 size={16} className="sug-icon" /> {sug}</li>
                        ))}
                      </ul>
                    </div>

                    {analysisResult.healthImpact && (
                      <div style={{
                        background: 'var(--color-primary-bg)',
                        border: '1px solid rgba(16, 185, 129, 0.15)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-4)',
                        marginBottom: 'var(--space-4)',
                        display: 'flex',
                        gap: 'var(--space-3)',
                        alignItems: 'flex-start',
                      }}>
                        <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: 2 }}>🌍</span>
                        <div>
                          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-primary)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            SDG 3 — Health Impact
                          </div>
                          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                            {analysisResult.healthImpact}
                          </p>
                        </div>
                      </div>
                    )}

                    <Button variant="primary" fullWidth size="lg" onClick={handleAddToLog}>
                      Add to Meal Log <ArrowRight size={18} />
                    </Button>
                  </CardBody>
                </Card>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="empty-result-state"
              >
                <ScanLine size={48} className="empty-icon" />
                <h3>Awaiting Input</h3>
                <p>Upload a photo or enter a description to see the AI analysis here.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default AIAnalyzer;
