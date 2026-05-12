import { useState, useRef, useEffect } from 'react';
import { ExternalLink, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  getActionTypeColor,
  getActionTypeLabel,
} from '@/types';
import type { QueueAction } from '@/types';

interface ActionCardProps {
  action: QueueAction;
  onApprove: (id: string) => void;
  onSkip: (id: string) => void;
  onEdit: (id: string, draft: string) => void;
  isProcessing: boolean;
}

export default function ActionCard({
  action,
  onApprove,
  onSkip,
  onEdit,
  isProcessing,
}: ActionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(action.draft_message);
  const [isExiting, setIsExiting] = useState(false);
  const [exitType, setExitType] = useState<'approve' | 'skip' | 'edit' | null>(null);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const typeColors = getActionTypeColor(action.action_type);
  const typeLabel = getActionTypeLabel(action.action_type);
  const isRepliedFlagged = action.action_type === 'replied_flagged';

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [isEditing]);

  const handleApproveClick = async () => {
    setExitType('approve');
    setIsExiting(true);
    try {
      await onApprove(action.id);
    } catch {
      setIsExiting(false);
      setExitType(null);
    }
  };

  const handleSkipClick = () => {
    setShowSkipConfirm(true);
  };

  const handleSkipConfirm = async () => {
    setShowSkipConfirm(false);
    setExitType('skip');
    setIsExiting(true);
    try {
      await onSkip(action.id);
    } catch {
      setIsExiting(false);
      setExitType(null);
    }
  };

  const handleEditSave = async () => {
    setExitType('edit');
    setIsExiting(true);
    try {
      await onEdit(action.id, editedText);
    } catch {
      setIsExiting(false);
      setExitType(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedText(action.draft_message);
  };

  const charCount = editedText.length;
  const isDm = action.action_type === 'first_dm' || action.action_type.includes('followup');
  const charWarning = isDm && charCount > 300;

  const exitAnimation = {
    approve: { x: 300, opacity: 0, backgroundColor: 'rgba(74, 222, 128, 0.15)' },
    skip: { x: 300, opacity: 0, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    edit: { x: 300, opacity: 0, backgroundColor: 'rgba(255, 178, 102, 0.15)' },
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={exitType ? exitAnimation[exitType] : { opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={cn(
            'glass-card overflow-hidden relative',
            isRepliedFlagged && 'border-l-[3px] border-l-red-500'
          )}
        >
          {/* Skip Confirmation Overlay */}
          <AnimatePresence>
            {showSkipConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-[#1a0818]/95 backdrop-blur-sm flex items-center justify-center rounded-2xl"
              >
                <div className="text-center p-6">
                  <p className="text-white font-semibold mb-4">Skip this action?</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setShowSkipConfirm(false)}
                      className="px-4 py-2 rounded-full border border-white/20 text-white/70 text-sm font-medium hover:bg-white/[0.06] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSkipConfirm}
                      className="px-4 py-2 rounded-full bg-[#f87171]/20 text-[#f87171] text-sm font-medium hover:bg-[#f87171]/30 transition-colors border border-[#f87171]/30"
                    >
                      Yes, Skip
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card Content */}
          <div className="p-4">
            {/* Header Row: Badge + Name + Company + LinkedIn */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border',
                      typeColors.bg,
                      typeColors.text,
                      typeColors.border
                    )}
                  >
                    {typeLabel}
                  </span>
                  {action.proof_angle && (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/[0.05] text-white/50 border border-white/[0.08]">
                      {action.proof_angle}
                    </span>
                  )}
                </div>
                <h3 className="text-white font-bold text-lg truncate">{action.lead_name}</h3>
                <p className="text-white/50 text-sm truncate">{action.company}</p>
              </div>
              {action.linkedin_url && (
                <a
                  href={action.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-[#FFB266] transition-all duration-200"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>

            {/* Draft Message */}
            {!isEditing ? (
              <p className="text-white/80 text-sm leading-relaxed mb-2">
                {action.draft_message}
              </p>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3"
              >
                <textarea
                  ref={textareaRef}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full min-h-[120px] p-3 bg-[#1a0818] border border-white/[0.12] rounded-xl text-white text-sm leading-relaxed resize-y focus:outline-none focus:border-[#FFB266]/40 focus:ring-1 focus:ring-[#FFB266]/20 transition-all"
                />
                <div className="flex items-center justify-between mt-2">
                  <span
                    className={cn(
                      'text-xs',
                      charWarning ? 'text-red-400' : 'text-white/30'
                    )}
                  >
                    {charCount} characters
                    {charWarning && ' (DMs should be ≤300)'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 rounded-full border border-white/20 text-white/70 text-xs font-medium hover:bg-white/[0.06] transition-colors"
                    >
                      Cancel Edit
                    </button>
                    <button
                      onClick={handleEditSave}
                      className="px-4 py-2 rounded-full bg-[#FFB266] text-[#4D1F4D] text-xs font-bold hover:bg-[#FFB266]/90 transition-colors"
                    >
                      Save Edit + Approve
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Context Clue */}
            {action.context_clue && (
              <p className="text-white/40 text-xs italic mb-2">
                Context: {action.context_clue}
              </p>
            )}

            {/* Next Action Date */}
            {action.next_action_date && (
              <div className="flex items-center gap-1.5 text-white/30 text-xs mb-3">
                <Calendar size={12} />
                <span>{new Date(action.next_action_date).toLocaleDateString()}</span>
              </div>
            )}

            {/* Action Buttons */}
            {!isEditing && (
              <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  onClick={handleSkipClick}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-full border border-white/[0.15] text-white/70 text-xs font-semibold hover:bg-white/[0.06] hover:text-white transition-all duration-200 disabled:opacity-50"
                >
                  Skip
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-full border border-white/[0.15] text-white/70 text-xs font-semibold hover:bg-white/[0.06] hover:text-white transition-all duration-200 disabled:opacity-50"
                >
                  Edit
                </button>
                <button
                  onClick={handleApproveClick}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-full bg-[#FFB266] text-[#4D1F4D] text-xs font-bold hover:bg-[#FFB266]/90 transition-all duration-200 approve-glow disabled:opacity-70"
                >
                  {isProcessing ? '...' : 'Approve'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
