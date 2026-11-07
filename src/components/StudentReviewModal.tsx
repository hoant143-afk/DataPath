import React, { useState } from 'react';
import { Send, X } from 'lucide-react';

interface StudentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: string) => void;
  initialDetails?: string;
}

export const StudentReviewModal: React.FC<StudentReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialDetails = '',
}) => {
  const [details, setDetails] = useState(initialDetails);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">Gửi yêu cầu giáo viên xem xét lại</h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 shrink-0 touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Nếu bạn cảm thấy lộ trình học tập hoặc phản hồi AI chưa chính xác với năng lực thực tế, hãy gửi yêu cầu để giáo viên trực tiếp kiểm tra.
          </p>
          <textarea
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Mô tả lý do bạn muốn giáo viên xem xét lại..."
            className="w-full text-xs p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto min-h-[40px] px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition touch-manipulation text-center"
          >
            Hủy
          </button>
          <button
            disabled={!details || details.trim().length === 0}
            onClick={() => {
              if (!details || details.trim().length === 0) return;
              onSubmit(details.trim());
              onClose();
            }}
            className="w-full sm:w-auto min-h-[40px] px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition touch-manipulation"
          >
            <Send className="w-3.5 h-3.5" /> Gửi yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
};
