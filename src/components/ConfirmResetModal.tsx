import React from 'react';
import { AlertTriangle, Trash2, X, RefreshCw } from 'lucide-react';

interface ConfirmResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isResetting?: boolean;
  totalChildren: number;
}

export const ConfirmResetModal: React.FC<ConfirmResetModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isResetting = false,
  totalChildren,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-rose-500 p-6 sm:p-7 space-y-5 text-[#1f2937]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">
                Ação Irreversível
              </span>
              <h3 className="font-['Nunito'] text-xl font-black text-gray-900">
                Zerar Todos os Cadastros?
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isResetting}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <div className="text-xs sm:text-sm text-gray-600 space-y-2 leading-relaxed">
          <p>
            Esta ação irá remover todas as <strong>{totalChildren}</strong> credenciais cadastradas e limpar o sorteio atual.
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
            ✨ O sistema será reiniciado do zero e a próxima criança registrada receberá a credencial oficial <strong>MPGA26-001</strong>.
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isResetting}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isResetting}
            className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-rose-600 hover:bg-rose-700 active:scale-95 text-white transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            {isResetting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Zerando...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Zerar Tudo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
