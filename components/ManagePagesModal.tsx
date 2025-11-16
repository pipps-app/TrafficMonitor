
import React, { useState } from 'react';
import type { LandingPage } from '../types';
import { XMarkIcon, TrashIcon, PlusIcon, ClipboardIcon, CheckIcon } from './IconComponents';

interface ManagePagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: Record<string, LandingPage>;
  onAddPage: (code: string, page: Omit<LandingPage, 'status' | 'trackingCode'>) => void;
  onDeletePage: (code: string) => void;
}

const ManagePagesModal: React.FC<ManagePagesModalProps> = ({
  isOpen,
  onClose,
  pages,
  onAddPage,
  onDeletePage,
}) => {
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState<'list' | 'success'>('list');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleAddPage = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedCode = newCode.toUpperCase().trim().replace(/\s+/g, '_');
    if (!normalizedCode || !newName.trim() || !newUrl.trim()) {
      setError('All fields are required.');
      return;
    }
    if (pages[normalizedCode]) {
      setError('This page code already exists.');
      return;
    }
    try {
        new URL(newUrl);
    } catch (_) {
        setError('Please enter a valid URL.');
        return;
    }

    onAddPage(normalizedCode, { name: newName.trim(), url: newUrl.trim() });
    setGeneratedCode(`<script async src="https://trackly.app/tracker.js?id=${normalizedCode}"></script>`);
    setView('success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode).then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
        setCopySuccess('Failed to copy');
    });
  };

  const handleCopyExistingCode = (code: string) => {
    const page = pages[code];
    if (page?.trackingCode) {
        navigator.clipboard.writeText(page.trackingCode).then(() => {
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        });
    }
  };

  const resetAndClose = () => {
    setNewCode('');
    setNewName('');
    setNewUrl('');
    setError('');
    setGeneratedCode('');
    setView('list');
    setCopiedCode(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700 m-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h2 className="text-xl font-bold text-white">
            {view === 'list' ? 'Manage Landing Pages' : 'Tracking Code Generated'}
          </h2>
          <button onClick={resetAndClose} className="text-gray-400 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {view === 'success' ? (
             <div className="space-y-4 text-center">
                <h3 className="text-lg font-semibold text-green-400">Page Added Successfully!</h3>
                <p className="text-gray-400">
                    To start tracking, add this code snippet to the &lt;head&gt; section of your website's HTML.
                </p>
                <div className="bg-gray-900 p-4 rounded-md text-left relative">
                    <code className="text-blue-300 text-sm whitespace-pre-wrap">{generatedCode}</code>
                    <button onClick={handleCopy} className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300">
                        {copySuccess ? copySuccess : <ClipboardIcon className="h-5 w-5" />}
                    </button>
                </div>
                <button
                  onClick={resetAndClose}
                  className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-500 transition-colors"
                >
                  Done
                </button>
             </div>
          ) : (
            <div className="space-y-6">
                {/* List of Existing Pages */}
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-300">Your Pages</h3>
                    {Object.keys(pages).length === 0 ? (
                        <p className="text-gray-400">You haven't added any pages yet.</p>
                    ) : (
                        <div className="divide-y divide-gray-700 rounded-md border border-gray-700">
                        {Object.entries(pages)
                            .filter(([, page]) => page && typeof page === 'object') // Defensive check to prevent crash on malformed data
                            .map(([code, page]) => (
                            <div key={code} className="flex items-center justify-between p-3 hover:bg-gray-700/50">
                                <div>
                                    <p className="font-semibold text-white">{page.name} <span className={`text-xs font-mono px-2 py-1 rounded-full ml-2 ${page.status === 'pending' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'}`}>{page.status}</span></p>
                                    <p className="text-sm text-gray-400 truncate">{page.url}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleCopyExistingCode(code)}
                                        className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-600"
                                        aria-label={`Copy tracking code for ${page.name}`}
                                    >
                                        {copiedCode === code ? <CheckIcon className="h-5 w-5 text-green-400" /> : <ClipboardIcon className="h-5 w-5" />}
                                    </button>
                                    <button
                                        onClick={() => onDeletePage(code)}
                                        className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10"
                                        aria-label={`Delete ${page.name}`}
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        </div>
                    )}
                </div>

                {/* Add New Page Form */}
                <div className="border-t border-gray-600 pt-6">
                    <h3 className="text-lg font-semibold text-gray-300 mb-3">Add a New Page</h3>
                    <form onSubmit={handleAddPage} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="new-code" className="block text-sm font-medium text-gray-400 mb-1">Page Code</label>
                                <input id="new-code" type="text" value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="e.g., Q1_PROMO" className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="new-name" className="block text-sm font-medium text-gray-400 mb-1">Page Name</label>
                                <input id="new-name" type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Q1 Promotion Page" className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="new-url" className="block text-sm font-medium text-gray-400 mb-1">URL</label>
                            <input id="new-url" type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://example.com/promo" className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-blue-500" />
                        </div>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <div className="flex justify-end">
                            <button type="submit" className="flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-500 transition-colors">
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add Page & Get Code
                            </button>
                        </div>
                    </form>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagePagesModal;
