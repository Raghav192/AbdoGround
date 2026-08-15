import React from 'react';
import { Download, RefreshCcw, FileText, Image as ImageIcon } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function ResultsViewer({ originalImage, heatmap, report, onReset }) {
  
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("AbdoGround - Radiology Report", 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 28);
    
    try {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Original X-Ray", 20, 45);
      doc.text("Attention Heatmap", 110, 45);
      
      doc.addImage(originalImage, "JPEG", 20, 50, 80, 80);
      doc.addImage(heatmap, "PNG", 110, 50, 80, 80);
    } catch (e) {
      console.error("Could not add images to PDF", e);
    }

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("AI Generated Findings:", 20, 145);
    
    doc.setFontSize(12);
    doc.setTextColor(50);
    const splitText = doc.splitTextToSize(report, 170);
    doc.text(splitText, 20, 155);

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Note: This is a research prototype. Not for clinical diagnosis.", 20, 280);

    doc.save("AbdoGround_Report.pdf");
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1000px', margin: '20px auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem' }}>Analysis Results</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn btn-secondary" onClick={onReset}>
            <RefreshCcw size={18} /> New Analysis
          </button>
          <button className="btn btn-accent" onClick={handleExportPDF}>
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Images Card */}
        <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border)', margin: 0, fontSize: '1.25rem' }}>
            <div style={{ background: 'var(--primary-light)', padding: '8px', borderRadius: '8px', color: 'var(--primary)' }}>
              <ImageIcon size={20} />
            </div>
            Visual Grounding
          </h3>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 500 }}>Original Input</div>
              <img 
                src={originalImage} 
                alt="Original Upload" 
                style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border)', objectFit: 'contain', backgroundColor: '#fafafa' }} 
              />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 500 }}>Attention Heatmap</div>
              <img 
                src={heatmap} 
                alt="AI Heatmap" 
                style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border)', objectFit: 'contain', backgroundColor: '#fafafa' }} 
              />
            </div>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px', background: 'var(--surface-hover)', padding: '12px', borderRadius: '8px' }}>
            Warmer regions indicate where the model focused when generating the report.
          </div>
        </div>

        {/* Report Card */}
        <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border)', margin: '0 0 24px 0', fontSize: '1.25rem' }}>
            <div style={{ background: 'var(--primary-light)', padding: '8px', borderRadius: '8px', color: 'var(--primary)' }}>
              <FileText size={20} />
            </div>
            Generated Findings
          </h3>
          <div style={{ 
            flex: 1, 
            background: 'var(--surface-hover)', 
            borderRadius: '12px', 
            padding: '24px',
            fontSize: '1.15rem',
            lineHeight: '1.7',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'flex-start'
          }}>
            {report || "No findings were generated for this image."}
          </div>
        </div>

      </div>
    </div>
  );
}
