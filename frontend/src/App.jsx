import React, { useState } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import Loader from './components/Loader';
import ResultsViewer from './components/ResultsViewer';
import { AlertCircle, BrainCircuit, Activity, Eye, ArrowRight } from 'lucide-react';

function App() {
  const [appState, setAppState] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [originalImage, setOriginalImage] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpload = async (file) => {
    setAppState('loading');
    setErrorMsg('');
    
    setOriginalImage(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setResultData(data);
      setAppState('success');
    } catch (err) {
      console.error("API Error:", err);
      setErrorMsg(err.message || 'An unexpected error occurred while analyzing the image.');
      setAppState('error');
    }
  };

  const handleReset = () => {
    setAppState('idle');
    setOriginalImage(null);
    setResultData(null);
    setErrorMsg('');
  };

  return (
    <>
      <Header />
      
      {/* 1. Hero Section */}
      <section style={{ position: 'relative', paddingTop: '160px', paddingBottom: '100px', textAlign: 'center' }}>
        <div className="hero-grid"></div>
        <div className="container animate-fade-in">
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: '#ffffff', 
            border: '1px solid var(--border)', 
            padding: '6px 16px', 
            borderRadius: '100px',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: 'var(--primary)',
            marginBottom: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <Activity size={14} /> Research Prototype v1.0
          </div>
          
          <h1 style={{ 
            fontSize: '4.5rem', 
            lineHeight: '1.05', 
            fontWeight: 700, 
            color: 'var(--text-main)',
            marginBottom: '24px',
            maxWidth: '900px',
            margin: '0 auto 24px'
          }}>
            Grounded chest X-ray <br/>
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{ position: 'relative', zIndex: 1, color: 'var(--primary)' }}>report generation</span>
              <span style={{ 
                position: 'absolute', 
                bottom: '6px', 
                left: 0, 
                right: 0, 
                height: '14px', 
                background: 'var(--accent)', 
                zIndex: 0,
                opacity: 0.6
              }}></span>
            </span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto 48px', lineHeight: 1.6 }}>
            AbdoGround uses visual explainability to anchor AI-generated radiology findings directly to clinically relevant image regions, increasing reliability and transparency.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <a href="#tool" className="btn" style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: '100px' }}>
              Try the Uploader <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* 2. Technology / Features */}
      <section id="technology" style={{ padding: '80px 0', background: '#ffffff', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Technology</div>
            <h2 style={{ fontSize: '2.5rem' }}>Latest advanced technologies to <br/>ensure clinical visibility</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '16px', maxWidth: '600px', margin: '16px auto 0' }}>
              We treat grounding as a first-class output. Every generated report ships with a heatmap showing exactly where the model attended.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ background: 'var(--primary-light)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '24px' }}>
                <BrainCircuit size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>DenseNet-121 Encoder</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                Utilizing a robust, pre-trained DenseNet-121 architecture to extract 7x7x1024 regional features from the uploaded frontal chest X-rays.
              </p>
            </div>
            
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ background: 'var(--primary-light)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '24px' }}>
                <Activity size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>LSTM Decoder</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                An advanced LSTM mechanism employing Bahdanau-style additive attention generates the findings paragraph one precise word at a time.
              </p>
            </div>

            <div className="card" style={{ padding: '32px' }}>
              <div style={{ background: 'var(--primary-light)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '24px' }}>
                <Eye size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Visual Grounding</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                Per-step attention weights are averaged over content words and overlaid as a heatmap, proving exactly where the model looked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Dark Architecture Section */}
      <section id="architecture" className="section-dark">
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '100px', fontSize: '0.85rem', marginBottom: '24px' }}>
            System Architecture
          </div>
          <h2 style={{ fontSize: '3rem', marginBottom: '24px' }}>Don't just predict. Explain.</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto 64px', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Recent multimodal models often fail to ground predictions. AbdoGround anchors text to regions. Built on Open-i data as a proxy to transfer to abdominal radiography.
          </p>

          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '24px', 
            padding: '48px',
            fontFamily: 'monospace',
            fontSize: '1.1rem',
            lineHeight: 2,
            textAlign: 'left',
            maxWidth: '800px',
            margin: '0 auto',
            color: 'rgba(255,255,255,0.8)'
          }}>
            Chest X-ray (224×224, grayscale)<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼<br/>
            &nbsp;&nbsp;DenseNet-121 encoder &nbsp;──►&nbsp; 7×7×1024 regional features<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼<br/>
            &nbsp;&nbsp;Additive attention &nbsp;◄────────────┐<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ (attention weights → heatmap)<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br/>
            &nbsp;&nbsp;LSTM decoder &nbsp;──►&nbsp; findings text, one word at a time
          </div>
        </div>
      </section>

      {/* 4. The Uploader Tool */}
      <section id="tool" style={{ padding: '100px 0', background: 'var(--bg-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2.5rem' }}>Experience AbdoGround</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>Upload a frontal chest X-ray to see the generated report and heatmap.</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {appState === 'idle' && (
              <ImageUploader onUpload={handleUpload} />
            )}
            
            {appState === 'loading' && (
              <Loader message="Analyzing chest X-ray and generating report..." />
            )}

            {appState === 'error' && (
              <div className="card animate-fade-in" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <AlertCircle size={32} color="var(--danger)" />
                </div>
                <h2 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>Analysis Failed</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>{errorMsg}</p>
                <button className="btn" onClick={handleReset}>Try Again</button>
              </div>
            )}

            {appState === 'success' && resultData && (
              <ResultsViewer 
                originalImage={originalImage} 
                report={resultData.report} 
                heatmap={`data:image/png;base64,${resultData.heatmap}`}
                onReset={handleReset} 
              />
            )}
          </div>
        </div>
      </section>

      {/* 5. Metrics Section */}
      <section id="metrics" style={{ padding: '60px 0 100px' }}>
        <div className="container">
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '24px', 
            padding: '64px', 
            display: 'flex', 
            justifyContent: 'space-around',
            boxShadow: '0 4px 40px rgba(0,0,0,0.03)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                3,307
              </div>
              <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Image-Report Pairs</div>
            </div>
            <div style={{ width: '1px', background: 'var(--border)' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                0.282
              </div>
              <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>BLEU-1 Score</div>
            </div>
            <div style={{ width: '1px', background: 'var(--border)' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                0.295
              </div>
              <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>ROUGE-L Score</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="section-footer">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '32px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={24} color="var(--accent)" />
            <span style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>AbdoGround</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
            Built as a research prototype exploring grounded medical report generation.
          </div>
        </div>
        <div className="container" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textAlign: 'center' }}>
          &copy; 2026 AbdoGround Research. Released under MIT License. Dataset: Indiana University Chest X-rays (CC BY-NC-ND 4.0).
        </div>
      </footer>
    </>
  );
}

export default App;
