import React, { useState, useMemo } from 'react';
import { RegisteredChild, SorteioWinner, DrawRoundRecord } from '../types';
import {
  Printer,
  X,
  Trophy,
  Users,
  Award,
  Sparkles,
  Calendar,
  Search,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  registeredChildren: RegisteredChild[];
  drawHistory: DrawRoundRecord[];
  currentWinners: SorteioWinner[];
}

export interface ChildPodiumStats {
  child: RegisteredChild;
  firstPlaceCount: number;
  secondPlaceCount: number;
  thirdPlaceCount: number;
  totalPodiumCount: number;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  registeredChildren,
  drawHistory,
  currentWinners,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'credential' | 'name' | 'podium' | 'first'>('credential');

  // Compute stats for all registered children across all draw rounds
  const statsList: ChildPodiumStats[] = useMemo(() => {
    // If we have recorded history rounds, count from all rounds
    // If history is empty but currentWinners has winners, treat currentWinners as 1 round
    const effectiveRounds: DrawRoundRecord[] = [...drawHistory];

    if (effectiveRounds.length === 0 && currentWinners.length > 0) {
      const w1 = currentWinners.find((w) => w.place === 1);
      const w2 = currentWinners.find((w) => w.place === 2);
      const w3 = currentWinners.find((w) => w.place === 3);
      if (w1 || w2 || w3) {
        effectiveRounds.push({
          id: 'initial-round',
          roundNumber: 1,
          drawnAt: w1?.drawnAt || currentWinners[0]?.drawnAt || 'Sorteio Atual',
          firstPlace: w1
            ? { credentialCode: w1.child.credentialCode, childName: w1.child.childName, childId: w1.child.id }
            : undefined,
          secondPlace: w2
            ? { credentialCode: w2.child.credentialCode, childName: w2.child.childName, childId: w2.child.id }
            : undefined,
          thirdPlace: w3
            ? { credentialCode: w3.child.credentialCode, childName: w3.child.childName, childId: w3.child.id }
            : undefined,
        });
      }
    }

    return registeredChildren.map((child) => {
      let firstCount = 0;
      let secondCount = 0;
      let thirdCount = 0;

      effectiveRounds.forEach((round) => {
        if (
          round.firstPlace &&
          (round.firstPlace.childId === child.id ||
            round.firstPlace.credentialCode === child.credentialCode)
        ) {
          firstCount++;
        }
        if (
          round.secondPlace &&
          (round.secondPlace.childId === child.id ||
            round.secondPlace.credentialCode === child.credentialCode)
        ) {
          secondCount++;
        }
        if (
          round.thirdPlace &&
          (round.thirdPlace.childId === child.id ||
            round.thirdPlace.credentialCode === child.credentialCode)
        ) {
          thirdCount++;
        }
      });

      return {
        child,
        firstPlaceCount: firstCount,
        secondPlaceCount: secondCount,
        thirdPlaceCount: thirdCount,
        totalPodiumCount: firstCount + secondCount + thirdCount,
      };
    });
  }, [registeredChildren, drawHistory, currentWinners]);

  // Overall metrics
  const totalChildren = registeredChildren.length;
  const totalRounds = Math.max(drawHistory.length, currentWinners.length > 0 ? 1 : 0);
  const totalWithPodium = statsList.filter((s) => s.totalPodiumCount > 0).length;
  const totalFirsts = statsList.reduce((acc, s) => acc + s.firstPlaceCount, 0);

  // Filter and sort for display
  const filteredAndSortedStats = useMemo(() => {
    let result = statsList.filter((item) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.child.credentialCode.toLowerCase().includes(term) ||
        item.child.childName.toLowerCase().includes(term) ||
        (item.child.guardianName && item.child.guardianName.toLowerCase().includes(term)) ||
        (item.child.cityNeighborhood && item.child.cityNeighborhood.toLowerCase().includes(term))
      );
    });

    result.sort((a, b) => {
      if (sortBy === 'podium') {
        if (b.totalPodiumCount !== a.totalPodiumCount) return b.totalPodiumCount - a.totalPodiumCount;
        if (b.firstPlaceCount !== a.firstPlaceCount) return b.firstPlaceCount - a.firstPlaceCount;
        return a.child.sequenceNumber - b.child.sequenceNumber;
      }
      if (sortBy === 'first') {
        if (b.firstPlaceCount !== a.firstPlaceCount) return b.firstPlaceCount - a.firstPlaceCount;
        if (b.totalPodiumCount !== a.totalPodiumCount) return b.totalPodiumCount - a.totalPodiumCount;
        return a.child.sequenceNumber - b.child.sequenceNumber;
      }
      if (sortBy === 'name') {
        return a.child.childName.localeCompare(b.child.childName);
      }
      return a.child.sequenceNumber - b.child.sequenceNumber;
    });

    return result;
  }, [statsList, searchTerm, sortBy]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDateFormatted = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const currentTimeFormatted = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:static print:inset-auto print:overflow-visible">
      {/* Top Floating Action Bar (Hidden when printed) */}
      <div className="w-full max-w-[210mm] bg-[#0854A7] text-white px-4 py-3 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 mb-4 print:hidden sticky top-2 z-10 border border-white/20">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-[#FFC300]" />
          <div>
            <h3 className="text-sm font-black tracking-wide font-['Nunito']">
              Visualização de Relatório A4
            </h3>
            <p className="text-[11px] text-blue-100">
              {totalChildren} cadastrados • {totalRounds} {totalRounds === 1 ? 'sorteio realizado' : 'sorteios realizados'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Main Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-[#FFC300] hover:bg-[#e6b000] text-[#0854A7] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            title="Imprimir na impressora agora (A4)"
          >
            <Printer className="w-4 h-4 text-[#0854A7]" />
            <span>Imprimir Relatório</span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Fechar visualização"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Screen Interactive Filters (Hidden when printed) */}
      <div className="w-full max-w-[210mm] bg-white px-4 py-2.5 rounded-xl shadow-md border border-gray-200 flex flex-wrap items-center justify-between gap-3 mb-4 print:hidden text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar por credencial, criança, responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:border-[#0854A7]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-bold">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-semibold cursor-pointer focus:outline-hidden"
          >
            <option value="credential">Ordem da Credencial</option>
            <option value="podium">Mais vezes no Pódio (Top 3)</option>
            <option value="first">Mais vezes em 1º Lugar</option>
            <option value="name">Nome da Criança (A-Z)</option>
          </select>
        </div>
      </div>

      {/* THE A4 PRINTABLE SHEET CONTAINER */}
      <div
        id="printable-a4-sheet"
        className="w-full max-w-[210mm] min-h-[297mm] bg-white text-[#111827] shadow-2xl rounded-sm p-6 sm:p-8 md:p-10 border border-gray-300 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full print:min-h-0 flex flex-col justify-between"
      >
        <div>
          {/* Top Decorative Stripe */}
          <div className="h-2 w-full bg-gradient-to-r from-[#0854A7] via-[#1EA8F5] via-[#FF2D78] to-[#FFC300] mb-5 rounded-full print:h-1.5" />

          {/* Document Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 border-gray-200 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-[#0854A7] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                  Documento Oficial
                </span>
                <span className="text-gray-400 text-xs">•</span>
                <span className="text-xs font-bold text-[#FF2D78]">
                  Festa Beneficente • 12 de Outubro
                </span>
              </div>
              <h1 className="font-['Nunito'] text-xl sm:text-2xl font-black text-[#0854A7] leading-tight">
                PROJETO DIA DAS CRIANÇAS - MPGA
              </h1>
              <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">
                Relatório Resumido de Cadastrados & Desempenho no Sorteio
              </p>
            </div>

            {/* Print Icon & Action inside the generated sheet */}
            <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto">
              {/* The required print icon inside the sheet */}
              <button
                type="button"
                onClick={handlePrint}
                className="print:hidden inline-flex items-center gap-2 bg-[#0854A7] hover:bg-[#064283] text-white px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow transition-all cursor-pointer"
                title="Imprimir esta folha na impressora"
              >
                <Printer className="w-4 h-4 text-[#FFC300]" />
                <span>Imprimir na Impressora</span>
              </button>

              <div className="text-[11px] text-gray-500 flex flex-wrap sm:flex-col sm:items-end gap-x-2">
                <span>
                  <strong>Emissão:</strong> {currentDateFormatted} às {currentTimeFormatted}
                </span>
                <span>
                  <strong>Total:</strong> {totalChildren} credenciais
                </span>
              </div>
            </div>
          </div>

          {/* Executive Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
            <div className="bg-[#FFF4EC] border border-[#FDD4B8] rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-[#0854A7] text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                <span>Cadastrados</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-[#0854A7] mt-0.5">
                {totalChildren}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-900 text-xs font-bold">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Sorteios Realizados</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-amber-900 mt-0.5">
                {totalRounds}
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-900 text-xs font-bold">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>No Pódio (1º, 2º ou 3º)</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-800 mt-0.5">
                {totalWithPodium}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-blue-900 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Vezes em 1º Lugar</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-blue-900 mt-0.5">
                {totalFirsts}
              </p>
            </div>
          </div>

          {/* Main Table */}
          <div className="border border-gray-300 rounded-xl overflow-hidden mt-3">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0854A7] text-white">
                  <th className="py-2 px-2.5 font-black text-center w-8">#</th>
                  <th className="py-2 px-2 font-black">Credencial</th>
                  <th className="py-2 px-2.5 font-black">Nome da Criança</th>
                  <th className="py-2 px-2 font-black text-center">Idade</th>
                  <th className="py-2 px-2.5 font-black">Responsável</th>
                  <th className="py-2 px-2 font-black">Bairro / Cidade</th>
                  <th className="py-2 px-1.5 font-black text-center bg-amber-500/20 text-white border-l border-white/20" title="Vezes em Primeiro Lugar">
                    🥇 1º
                  </th>
                  <th className="py-2 px-1.5 font-black text-center bg-slate-300/20 text-white" title="Vezes em Segundo Lugar">
                    🥈 2º
                  </th>
                  <th className="py-2 px-1.5 font-black text-center bg-amber-700/20 text-white" title="Vezes em Terceiro Lugar">
                    🥉 3º
                  </th>
                  <th className="py-2 px-2 font-black text-center bg-black/20 text-white border-l border-white/20">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedStats.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-6 text-gray-500 font-bold">
                      Nenhum participante encontrado para os critérios pesquisados.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedStats.map((item, index) => {
                    const isPodium = item.totalPodiumCount > 0;
                    return (
                      <tr
                        key={item.child.id}
                        className={`${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'
                        } ${isPodium ? 'font-semibold' : ''}`}
                      >
                        <td className="py-1.5 px-2.5 text-center text-gray-500 text-[11px]">
                          {item.child.sequenceNumber}
                        </td>
                        <td className="py-1.5 px-2 font-mono font-bold text-[#0854A7] whitespace-nowrap text-[11px]">
                          {item.child.credentialCode}
                        </td>
                        <td className="py-1.5 px-2.5 text-gray-900 font-bold">
                          {item.child.childName}
                        </td>
                        <td className="py-1.5 px-2 text-center text-gray-700 text-[11px]">
                          {item.child.age} anos
                        </td>
                        <td className="py-1.5 px-2.5 text-gray-700 text-[11px] truncate max-w-[120px]">
                          {item.child.guardianName || '—'}
                        </td>
                        <td className="py-1.5 px-2 text-gray-600 text-[11px] truncate max-w-[110px]">
                          {item.child.cityNeighborhood || '—'}
                        </td>

                        {/* 1º Lugar */}
                        <td className="py-1.5 px-1.5 text-center border-l border-gray-200 bg-amber-50/40">
                          {item.firstPlaceCount > 0 ? (
                            <span className="inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full bg-[#FFC300] text-black font-black text-[11px] shadow-xs">
                              {item.firstPlaceCount}
                            </span>
                          ) : (
                            <span className="text-gray-300 font-normal">0</span>
                          )}
                        </td>

                        {/* 2º Lugar */}
                        <td className="py-1.5 px-1.5 text-center bg-gray-100/50">
                          {item.secondPlaceCount > 0 ? (
                            <span className="inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full bg-slate-300 text-slate-900 font-black text-[11px]">
                              {item.secondPlaceCount}
                            </span>
                          ) : (
                            <span className="text-gray-300 font-normal">0</span>
                          )}
                        </td>

                        {/* 3º Lugar */}
                        <td className="py-1.5 px-1.5 text-center bg-amber-100/40">
                          {item.thirdPlaceCount > 0 ? (
                            <span className="inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full bg-amber-700 text-white font-black text-[11px]">
                              {item.thirdPlaceCount}
                            </span>
                          ) : (
                            <span className="text-gray-300 font-normal">0</span>
                          )}
                        </td>

                        {/* Total no Pódio */}
                        <td className="py-1.5 px-2 text-center border-l border-gray-200 bg-blue-50/50">
                          {item.totalPodiumCount > 0 ? (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-[#0854A7] text-white font-black text-[11px]">
                              {item.totalPodiumCount}
                            </span>
                          ) : (
                            <span className="text-gray-400 font-normal">0</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Historical rounds summary notes if draws exist */}
          {drawHistory.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-xl text-[11px] text-gray-700">
              <p className="font-bold text-[#0854A7] mb-1 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#FFC300]" />
                <span>Histórico de Rodadas Realizadas:</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {drawHistory.map((round) => (
                  <div key={round.id} className="bg-white p-2 rounded-lg border border-gray-200">
                    <span className="font-bold text-gray-900">Rodada {round.roundNumber}</span> ({round.drawnAt}):
                    <div className="text-[10px] mt-0.5 space-y-0.5 text-gray-600">
                      <div>🥇 <strong>1º Lugar:</strong> {round.firstPlace?.credentialCode || '—'} {round.firstPlace?.childName ? `(${round.firstPlace.childName})` : ''}</div>
                      <div>🥈 <strong>2º Lugar:</strong> {round.secondPlace?.credentialCode || '—'} {round.secondPlace?.childName ? `(${round.secondPlace.childName})` : ''}</div>
                      <div>🥉 <strong>3º Lugar:</strong> {round.thirdPlace?.credentialCode || '—'} {round.thirdPlace?.childName ? `(${round.thirdPlace.childName})` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer & Formal Signatures for Official A4 Document */}
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <div className="grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-1">
              <div className="border-b border-gray-400 w-3/4 mx-auto mb-2" />
              <p className="font-bold text-gray-800">Comissão Organizadora</p>
              <p className="text-[10px] text-gray-500">Projeto Dia das Crianças - MPGA</p>
            </div>
            <div className="space-y-1">
              <div className="border-b border-gray-400 w-3/4 mx-auto mb-2" />
              <p className="font-bold text-gray-800">Responsável pelo Sorteio</p>
              <p className="text-[10px] text-gray-500">Homologação e Auditoria das Credenciais</p>
            </div>
          </div>

          <div className="mt-5 text-center text-[10px] text-gray-400 flex items-center justify-between">
            <span>Página 1 de 1 • Formato Padrão A4</span>
            <span>Documento emitido eletronicamente para transparência pública do evento</span>
          </div>
        </div>
      </div>
    </div>
  );
};
