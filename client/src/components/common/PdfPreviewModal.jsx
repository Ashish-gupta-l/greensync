import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import {
    HiX, HiDownload, HiExternalLink, HiDocumentText,
    HiZoomIn, HiZoomOut
} from 'react-icons/hi';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Use CDN worker — no local worker config needed
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

/**
 * PdfPreviewModal
 * Props:
 *   isOpen      : boolean
 *   onClose     : () => void
 *   proxyUrl    : string  — server-proxied URL  /api/submissions/:id/file?token=... (preferred)
 *   directUrl   : string  — direct Cloudinary URL (fallback / download)
 *   title       : string
 *   studentName : string  (optional, teacher view)
 */
export default function PdfPreviewModal({ isOpen, onClose, proxyUrl, directUrl, title, studentName }) {
    const [numPages, setNumPages] = useState(null);
    const [scale, setScale] = useState(1.2);
    const [pdfError, setPdfError] = useState(false);
    const [loading, setLoading] = useState(true);

    // Reset when PDF source changes
    useEffect(() => {
        setNumPages(null);
        setPdfError(false);
        setLoading(true);
    }, [proxyUrl, directUrl]);

    // Esc key close
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    // Body scroll lock
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const onDocumentLoadSuccess = useCallback(({ numPages }) => {
        setNumPages(numPages);
        setLoading(false);
        setPdfError(false);
    }, []);

    const onDocumentLoadError = useCallback((err) => {
        console.error('[PdfPreviewModal] load error:', err);
        setPdfError(true);
        setLoading(false);
    }, []);

    // Use proxy URL for rendering (server adds correct Content-Type headers)
    // Fall back to directUrl if no proxy available
    const renderUrl = proxyUrl || directUrl;
    // Use proxy for download too (avoids Content-Type issues with raw Cloudinary)
    const downloadUrl = proxyUrl || directUrl;

    if (!renderUrl) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 pointer-events-none"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    >
                        <div
                            className="pointer-events-auto w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                            style={{ maxHeight: 'calc(100vh - 32px)', height: '92vh' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* ── Header ── */}
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                        <HiDocumentText className="text-emerald-600 text-lg" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                            {title || 'Submission PDF'}
                                        </p>
                                        {studentName && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">by {studentName}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                                    {/* Zoom controls */}
                                    <button
                                        onClick={() => setScale(s => Math.max(0.6, +(s - 0.2).toFixed(1)))}
                                        className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                        title="Zoom out"
                                    >
                                        <HiZoomOut />
                                    </button>
                                    <span className="text-xs text-gray-500 w-9 text-center font-mono select-none">
                                        {Math.round(scale * 100)}%
                                    </span>
                                    <button
                                        onClick={() => setScale(s => Math.min(3, +(s + 0.2).toFixed(1)))}
                                        className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                        title="Zoom in"
                                    >
                                        <HiZoomIn />
                                    </button>

                                    <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

                                    {/* Download — uses proxy URL so Content-Type is correct */}
                                    <a
                                        href={downloadUrl}
                                        download
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                                    >
                                        <HiDownload className="text-sm" />
                                        <span className="hidden sm:inline">Download</span>
                                    </a>

                                    {/* Open in new tab — uses proxy URL */}
                                    <a
                                        href={downloadUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <HiExternalLink className="text-sm" />
                                        <span className="hidden sm:inline">Open</span>
                                    </a>

                                    {/* Close */}
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                                    >
                                        <HiX />
                                    </button>
                                </div>
                            </div>

                            {/* ── PDF Viewer ── */}
                            <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-800 relative">

                                {/* Loading spinner */}
                                {loading && !pdfError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                                        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-3" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading PDF...</p>
                                    </div>
                                )}

                                {/* Error fallback */}
                                {pdfError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 text-center">
                                        <div className="text-6xl">📄</div>
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-white text-lg mb-2">
                                                Cannot preview this PDF inline
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                                                The PDF is accessible — use the buttons below to view or download it.
                                            </p>
                                            <div className="flex gap-3 justify-center flex-wrap">
                                                <a
                                                    href={downloadUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                                                >
                                                    <HiExternalLink /> Open PDF in New Tab
                                                </a>
                                                <a
                                                    href={downloadUrl}
                                                    download
                                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    <HiDownload /> Download PDF
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* react-pdf renderer */}
                                {!pdfError && (
                                    <div className="flex justify-center py-6 px-4 min-h-full">
                                        <Document
                                            file={renderUrl}
                                            onLoadSuccess={onDocumentLoadSuccess}
                                            onLoadError={onDocumentLoadError}
                                            loading={null}
                                            options={{
                                                httpHeaders: {},   // proxy URL has token in query param already
                                                withCredentials: false,
                                            }}
                                            className="flex flex-col items-center gap-4"
                                        >
                                            {numPages && Array.from({ length: numPages }, (_, idx) => (
                                                <Page
                                                    key={`page_${idx + 1}`}
                                                    pageNumber={idx + 1}
                                                    scale={scale}
                                                    renderTextLayer={true}
                                                    renderAnnotationLayer={true}
                                                    className="shadow-2xl rounded-lg overflow-hidden"
                                                />
                                            ))}
                                        </Document>
                                    </div>
                                )}
                            </div>

                            {/* ── Footer ── */}
                            <div className="px-5 py-2.5 border-t border-gray-100 dark:border-gray-800 text-center flex-shrink-0">
                                <p className="text-xs text-gray-400">
                                    {numPages ? `${numPages} page${numPages > 1 ? 's' : ''} · Scroll to read ·` : ''}
                                    {' '}Press <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">Esc</kbd> to close
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
