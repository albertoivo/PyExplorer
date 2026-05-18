import { useRef, useState } from 'react';
// jsPDF and html2canvas are now lazy-loaded for performance
import './CertificateGenerator.css';

interface CertificateGeneratorProps {
    studentName: string;
    completionDate: string;
}

export function CertificateGenerator({ studentName, completionDate }: CertificateGeneratorProps) {
    const certificateRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        console.log('Download started');
        if (!certificateRef.current) {
            console.log('Ref is null');
            return;
        }
        setIsGenerating(true);

        try {
            // Lazy load jsPDF and html2canvas only when needed
            const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
                import('jspdf'),
                import('html2canvas')
            ]);

            const canvas = await html2canvas(certificateRef.current, {
                scale: 2, // Higher resolution
                useCORS: true,
                backgroundColor: '#1e1e2e', // Match theme
            });
            console.log('html2canvas done');

            const imgData = canvas.toDataURL('image/png');
            console.log('Creating PDF');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            console.log('Saving PDF');
            pdf.save(`PyExplorer_Certificate_${studentName.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error('Error generating certificate:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="certificate-generator">
            <div className="certificate-preview-container">
                <div ref={certificateRef} className="certificate-frame">
                    <div className="certificate-border">
                        <div className="certificate-content">
                            <div className="certificate-header">
                                <span className="certificate-icon">🐍</span>
                                <h1>Certificado de Conclusão</h1>
                                <p className="certificate-subtitle">PyExplorer Academy</p>
                            </div>

                            <div className="certificate-body">
                                <p className="certificate-text">Certificamos que</p>
                                <h2 className="student-name">{studentName}</h2>
                                <p className="certificate-text">
                                    completou com sucesso a jornada do iniciante em
                                </p>
                                <h3 className="course-title">Programação Python</h3>
                            </div>

                            <div className="certificate-footer">
                                <div className="signature-block">
                                    <p>Mestre Py</p>
                                    <small>Instrutor Chefe</small>
                                </div>

                                <div className="badge-block">
                                    <div className="completion-badge">🏆 100%</div>
                                </div>

                                <div className="date-block">
                                    <p className="date-text">Data: {completionDate}</p>
                                    <small>pyexplorer.firebaseapp.com</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="certificate-controls">
                <button
                    onClick={handleDownload}
                    className="download-btn"
                    disabled={isGenerating}
                >
                    {isGenerating ? 'Gerando PDF...' : '📥 Baixar Certificado (PDF)'}
                </button>
                <button
                    onClick={() => {
                        const shareData = {
                            title: 'PyExplorer - Certificado de Conclusão',
                            text: `Eu completei a jornada de Programação Python no PyExplorer! 🚀🐍`,
                            url: window.location.origin
                        };
                        if (navigator.share) {
                            navigator.share(shareData).catch(console.error);
                        } else {
                            navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                            alert('Link copiado para a área de transferência!');
                        }
                    }}
                    className="download-btn share-btn"
                >
                    📤 Compartilhar
                </button>
            </div>
        </div>
    );
}
