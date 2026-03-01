import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiX, HiDownload, HiExternalLink, HiDocumentText,
    HiZoomIn, HiZoomOut
} from 'react-icons/hi';

/**
 * PdfPreviewModal
 * Props:
 *   isOpen    : boolean
 *   onClose   : () => void
 *   pdfUrl    : string  (direct PDF URL)
 *   title     : string  (assignment title)
 *   studentName: string (optional, shown for teacher view)
 */
export default function PdfPreviewModal({ isOpen, onClose, pdfUrl, title, studentName }) {
    const iframeRef = useRef(null);

    // close on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    // prevent body scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!pdfUrl) return null;

    // For Cloudinary URLs or any direct PDF, use Google Docs viewer as reliable fallback
    const isCloudinary = pdfUrl.includes('cloudinary.com') || pdfUrl.includes('res.cloudinary');
    const viewerUrl = isCloudinary
        ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`
        : pdfUrl;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    >
                        <div
                            className="pointer-events-auto w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                            style={{ maxHeight: 'calc(100vh - 32px)', height: '90vh' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                                        <HiDocumentText className="text-primary-600 text-lg" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{title || 'Submission PDF'}</p>
                                        {studentName && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">by {studentName}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                    {/* Download Button */}
                                    <a
                                        href={pdfUrl}
                                        download
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-xs font-semibold hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                                    >
                                        <HiDownload className="text-sm" />
                                        <span className="hidden sm:inline">Download</span>
                                    </a>

                                    {/* Open in new tab */}
                                    <a
                                        href={pdfUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <HiExternalLink className="text-sm" />
                                        <span className="hidden sm:inline">New Tab</span>
                                    </a>

                                    {/* Close */}
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white transition-colors"
                                    >
                                        <HiX />
                                    </button>
                                </div>
                            </div>

                            {/* PDF Viewer */}
                            <div className="flex-1 relative bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <iframe
                                    ref={iframeRef}
                                    src={viewerUrl}
                                    title="PDF Preview"
                                    className="w-full h-full border-0"
                                    allow="fullscreen"
                                />

                                {/* Loading overlay */}
                                <div
                                    className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 pointer-events-none"
                                    style={{ zIndex: -1 }}
                                >
                                    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-3" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading PDF...</p>
                                </div>
                            </div>

                            {/* Footer hint */}
                            <div className="px-5 py-2.5 border-t border-gray-100 dark:border-gray-800 text-center flex-shrink-0">
                                <p className="text-xs text-gray-400">
                                    Press <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">Esc</kbd> to close · Click outside to dismiss
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
