import React, { useState, useEffect } from 'react';
import { RegisteredChild, SorteioWinner, ReplacementLog, ScreenType } from '../../types';
import {
  subscribeToSorteioState,
  saveSorteioStateToFirestore,
} from '../../services/firebaseService';
import {
  Trophy,
  Medal,
  Gift,
  Star,
  RefreshCw,
  UserX,
  Sparkles,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Search,
  Check,
  X,
  Award,
  Filter,
  Printer
} from 'lucide-react';

interface SorteioScreenProps {
  registeredChildren: RegisteredChild[];
  onNavigate: (screen: ScreenType) => void;
  onResetChildren?: () => void;
  onRefreshChildren?: () => Promise<number | void> | void;
}

const MAX_WINNERS = 20;

export const SorteioScreen: React.FC<SorteioScreenProps> = ({
  registeredChildren,
  onNavigate,
  onResetChildren,
  onRefreshChildren,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const handleRefresh = async () => {
    if (!onRefreshChildren || isRefreshing) return;
    setIsRefreshing(true);
    setRefreshMessage(null);
    try {
      await onRefreshChildren();
      setRefreshMessage('Atualizado!');
      setTimeout(() => setRefreshMessage(null), 2500);
    } catch (err) {
      console.error('Error refreshing children in sorteio', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Persistence for winners in local storage so page refreshes don't lose the live draw
  const [winners, setWinners] = useState<SorteioWinner[]>(() => {
    try {
      const saved = localStorage.getItem('mpga_sorteio_winners_v20');
      if (saved) {
        const parsed: SorteioWinner[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((w) => ({
            ...w,
            child: {
              ...w.child,
              credentialCode: w.child.credentialCode.includes('-MPGA26')
                ? `MPGA26-${String(w.child.sequenceNumber).padStart(3, '0')}`
                : w.child.credentialCode,
            },
          }));
        }
      }
    } catch (e) {
      console.error('Error loading sorteio winners', e);
    }
    return [];
  });

  const [absentIds, setAbsentIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mpga_sorteio_absent_ids_v20');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading absent ids', e);
    }
    return [];
  });

  const [replacementLogs, setReplacementLogs] = useState<ReplacementLog[]>(() => {
    try {
      const saved = localStorage.getItem('mpga_sorteio_replacement_logs_v20');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading replacement logs', e);
    }
    return [];
  });

  const [isDrawing, setIsDrawing] = useState(false);
  const [displayCyclingNumber, setDisplayCyclingNumber] = useState('MPGA26-001');
  const [replacementModalOpen, setReplacementModalOpen] = useState(false);
  const [selectedPlaceForReplacement, setSelectedPlaceForReplacement] = useState<number | null>(null);
  const [recentReplacementNote, setRecentReplacementNote] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [winnerSearchTerm, setWinnerSearchTerm] = useState('');
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [showPoolList, setShowPoolList] = useState(false);

  // Firebase real-time synchronization for Sorteio across all screens
  useEffect(() => {
    const unsub = subscribeToSorteioState((state) => {
      if (state && state.winners && state.winners.length > 0) {
        setWinners(state.winners);
        setAbsentIds(state.absentIds || []);
        setReplacementLogs(state.replacementLogs || []);
      }
    });
    return () => unsub();
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('mpga_sorteio_winners_v20', JSON.stringify(winners));
    } catch (e) {
      console.error('Error saving winners', e);
    }
  }, [winners]);

  useEffect(() => {
    try {
      localStorage.setItem('mpga_sorteio_absent_ids_v20', JSON.stringify(absentIds));
    } catch (e) {
      console.error('Error saving absent ids', e);
    }
  }, [absentIds]);

  useEffect(() => {
    try {
      localStorage.setItem('mpga_sorteio_replacement_logs_v20', JSON.stringify(replacementLogs));
    } catch (e) {
      console.error('Error saving replacement logs', e);
    }
  }, [replacementLogs]);

  // Main draw: randomly draws all registered children up to MAX_WINNERS (20)
  const handlePerformDraw = () => {
    if (registeredChildren.length === 0) {
      alert('Nenhuma criança cadastrada ainda. Cadastre novas crianças na tela inicial para realizar o sorteio.');
      return;
    }

    setIsDrawing(true);

    // Number cycling animation for excitement
    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      const randIndex = Math.floor(Math.random() * registeredChildren.length);
      setDisplayCyclingNumber(registeredChildren[randIndex].credentialCode);
      if (counter > (registeredChildren.length === 1 ? 12 : 24)) {
        clearInterval(interval);
        finalizeDraw();
      }
    }, 60);
  };

  const finalizeDraw = () => {
    // Shuffle all registered children
    const pool = [...registeredChildren];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const countToDraw = Math.min(pool.length, MAX_WINNERS);
    const selectedWinners: SorteioWinner[] = [];

    for (let i = 0; i < countToDraw; i++) {
      selectedWinners.push({
        place: i + 1,
        child: pool[i],
        drawnAt: now,
      });
    }

    setWinners(selectedWinners);
    setAbsentIds([]);
    setReplacementLogs([]);
    setIsDrawing(false);

    // Persist to Firebase Firestore
    saveSorteioStateToFirestore(selectedWinners, [], []).catch((err) => {
      console.warn('Firestore Sorteio sync note:', err.message);
    });
  };

  // Replace a winner because they were absent at the awards ceremony
  const handleConfirmReplacement = (placeToReplace: number) => {
    const currentWinner = winners.find((w) => w.place === placeToReplace);
    if (!currentWinner) return;

    // Current winner IDs already holding other places
    const activeWinnerIds = winners.map((w) => w.child.id);
    const newAbsentList = [...absentIds, currentWinner.child.id];

    // Available pool = registered children not in active winners and not in absent list
    const availablePool = registeredChildren.filter(
      (c) => !activeWinnerIds.includes(c.id) && !newAbsentList.includes(c.id)
    );

    if (availablePool.length === 0) {
      alert(
        'Não há outras credenciais disponíveis para sorteio além dos que já ganharam ou foram marcados como ausentes.'
      );
      return;
    }

    // Pick a new random child from the available pool
    const randomIndex = Math.floor(Math.random() * availablePool.length);
    const newChild = availablePool[randomIndex];
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newWinner: SorteioWinner = {
      place: placeToReplace,
      child: newChild,
      drawnAt: nowTime,
      replacedFrom: {
        credentialCode: currentWinner.child.credentialCode,
        childName: currentWinner.child.childName,
        replacedAt: nowTime,
      },
    };

    // Log the replacement
    const newLog: ReplacementLog = {
      id: `log-${Date.now()}`,
      place: placeToReplace,
      previousCredential: currentWinner.child.credentialCode,
      previousName: currentWinner.child.childName,
      newCredential: newChild.credentialCode,
      newName: newChild.childName,
      timestamp: nowTime,
    };

    const updatedWinners = winners.map((w) => (w.place === placeToReplace ? newWinner : w));
    const updatedReplacementLogs = [newLog, ...replacementLogs];

    setWinners(updatedWinners);
    setAbsentIds(newAbsentList);
    setReplacementLogs(updatedReplacementLogs);
    setReplacementModalOpen(false);
    setSelectedPlaceForReplacement(null);

    // Persist replacement to Firestore
    saveSorteioStateToFirestore(updatedWinners, newAbsentList, updatedReplacementLogs).catch((err) => {
      console.warn('Firestore replacement sync note:', err.message);
    });

    setRecentReplacementNote(
      `O ${placeToReplace}º Lugar foi substituído com sucesso! Nova credencial sorteada: ${newChild.credentialCode} (${newChild.childName}).`
    );

    setTimeout(() => {
      setRecentReplacementNote(null);
    }, 6000);
  };

  const getWinnerTheme = (place: number) => {
    switch (place) {
      case 1:
        return {
          title: '1º Lugar',
          subtitle: 'Primeiro Sorteado',
          border: 'border-[#FFC300]',
          bgGradient: 'from-amber-50 to-white',
          badgeBg: 'bg-[#FFC300] text-black font-black',
          iconColor: 'text-[#FFC300]',
          icon: <Trophy className="w-6 h-6 text-[#FFC300] fill-[#FFC300]" />,
          glow: 'shadow-amber-100',
        };
      case 2:
        return {
          title: '2º Lugar',
          subtitle: 'Segundo Sorteado',
          border: 'border-[#1EA8F5]',
          bgGradient: 'from-sky-50 to-white',
          badgeBg: 'bg-[#1EA8F5] text-white font-black',
          iconColor: 'text-[#1EA8F5]',
          icon: <Medal className="w-6 h-6 text-[#1EA8F5]" />,
          glow: 'shadow-sky-100',
        };
      case 3:
        return {
          title: '3º Lugar',
          subtitle: 'Terceiro Sorteado',
          border: 'border-[#FF2D78]',
          bgGradient: 'from-pink-50 to-white',
          badgeBg: 'bg-[#FF2D78] text-white font-black',
          iconColor: 'text-[#FF2D78]',
          icon: <Gift className="w-6 h-6 text-[#FF2D78]" />,
          glow: 'shadow-pink-100',
        };
      case 4:
        return {
          title: '4º Lugar',
          subtitle: 'Quarto Sorteado',
          border: 'border-[#6CC24A]',
          bgGradient: 'from-emerald-50 to-white',
          badgeBg: 'bg-[#6CC24A] text-white font-black',
          iconColor: 'text-[#6CC24A]',
          icon: <Star className="w-6 h-6 text-[#6CC24A] fill-[#6CC24A]" />,
          glow: 'shadow-emerald-100',
        };
      case 5:
      case 6:
      case 7:
      case 8:
        return {
          title: `${place}º Lugar`,
          subtitle: `${place}º Sorteado`,
          border: 'border-indigo-300 hover:border-indigo-400',
          bgGradient: 'from-indigo-50/50 to-white',
          badgeBg: 'bg-indigo-600 text-white font-black',
          iconColor: 'text-indigo-600',
          icon: <Award className="w-5 h-5 text-indigo-600" />,
          glow: 'shadow-indigo-50',
        };
      case 9:
      case 10:
      case 11:
      case 12:
        return {
          title: `${place}º Lugar`,
          subtitle: `${place}º Sorteado`,
          border: 'border-cyan-300 hover:border-cyan-400',
          bgGradient: 'from-cyan-50/50 to-white',
          badgeBg: 'bg-[#0854A7] text-white font-black',
          iconColor: 'text-[#0854A7]',
          icon: <Sparkles className="w-5 h-5 text-[#1EA8F5]" />,
          glow: 'shadow-cyan-50',
        };
      case 13:
      case 14:
      case 15:
      case 16:
        return {
          title: `${place}º Lugar`,
          subtitle: `${place}º Sorteado`,
          border: 'border-amber-300 hover:border-amber-400',
          bgGradient: 'from-amber-50/50 to-white',
          badgeBg: 'bg-amber-600 text-white font-black',
          iconColor: 'text-amber-600',
          icon: <Medal className="w-5 h-5 text-amber-600" />,
          glow: 'shadow-amber-50',
        };
      default:
        return {
          title: `${place}º Lugar`,
          subtitle: `${place}º Sorteado`,
          border: 'border-emerald-300 hover:border-emerald-400',
          bgGradient: 'from-emerald-50/50 to-white',
          badgeBg: 'bg-emerald-600 text-white font-black',
          iconColor: 'text-emerald-600',
          icon: <Gift className="w-5 h-5 text-emerald-600" />,
          glow: 'shadow-emerald-50',
        };
    }
  };

  const filteredPool = registeredChildren.filter((c) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      c.childName.toLowerCase().includes(term) ||
      c.credentialCode.toLowerCase().includes(term)
    );
  });

  const filteredWinners = winners.filter((w) => {
    const term = winnerSearchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      w.child.childName.toLowerCase().includes(term) ||
      w.child.credentialCode.toLowerCase().includes(term) ||
      String(w.place).includes(term) ||
      (w.child.guardianName && w.child.guardianName.toLowerCase().includes(term))
    );
  });

  const filteredModalWinners = winners.filter((w) => {
    const term = modalSearchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      w.child.childName.toLowerCase().includes(term) ||
      w.child.credentialCode.toLowerCase().includes(term) ||
      String(w.place).includes(term)
    );
  });

  return (
    <div className="w-full flex flex-col bg-white">
      {/* Header Section */}
      <section className="py-10 md:py-14 px-4 md:px-8 bg-white border-b border-gray-100">
        <div className="max-w-[1240px] mx-auto">
          {/* Top navigation helper */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <button
              onClick={() => onNavigate('inicio')}
              className="inline-flex items-center gap-2 text-[#0854A7] hover:text-[#FF2D78] font-black text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para Cadastros (Início)</span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 bg-[#FFF3EB] border border-[#FFC300] px-3.5 py-1.5 rounded-full text-xs font-black text-[#0854A7]">
                <Users className="w-4 h-4 text-[#FF2D78]" />
                <span>{registeredChildren.length} {registeredChildren.length === 1 ? 'Credencial Participante' : 'Credenciais Participantes'}</span>
              </span>

              {onRefreshChildren && (
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing || isDrawing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0854A7] border border-blue-200 rounded-full text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  title="Atualizar lista de cadastrados em tempo real"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#0854A7] ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Lista'}</span>
                </button>
              )}

              <button
                onClick={() => setShowPoolList(!showPoolList)}
                className="text-xs font-bold text-[#0854A7] hover:underline cursor-pointer"
              >
                {showPoolList ? 'Ocultar Lista' : 'Ver Todas as Credenciais'}
              </button>
            </div>
          </div>

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#FF2D78] bg-[#FFF3EB] px-3.5 py-1 rounded-full border border-[#FF2D78]/30 inline-block">
              Premiação Oficial • 12 de Outubro
            </span>
            <h1 className="font-['Nunito'] text-3xl sm:text-4xl md:text-5xl font-black text-[#0854A7] leading-tight">
              Sorteio de Credenciais
            </h1>
          </div>

          {/* Quick drawer of eligible credentials pool */}
          {showPoolList && (
            <div className="mt-8 bg-[#FFF9F5] border-2 border-[#FDD4B8] rounded-2xl p-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h4 className="font-bold text-sm text-[#0854A7] font-['Nunito'] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6CC24A]" />
                  <span>Credenciais cadastradas aptas para o sorteio ({registeredChildren.length})</span>
                </h4>
                <div className="relative max-w-xs w-full">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrar por nome ou número..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-full pl-8 pr-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:border-[#0854A7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-52 overflow-y-auto pr-1">
                {filteredPool.map((c) => {
                  const isWinner = winners.some((w) => w.child.id === c.id);
                  const isAbsent = absentIds.includes(c.id);

                  return (
                    <div
                      key={c.id}
                      className={`px-3 py-2 rounded-xl text-xs flex flex-col justify-between border ${
                        isWinner
                          ? 'bg-amber-100 border-[#FFC300] text-amber-900 font-bold'
                          : isAbsent
                          ? 'bg-rose-50 border-rose-200 text-rose-800 line-through opacity-70'
                          : 'bg-white border-gray-200 text-[#111827]'
                      }`}
                    >
                      <span className="font-mono font-black text-xs">{c.credentialCode}</span>
                      <span className="truncate text-[11px] font-medium mt-0.5">{c.childName}</span>
                      {isWinner && <span className="text-[9px] text-amber-700 font-black">★ Sorteado</span>}
                      {isAbsent && <span className="text-[9px] text-rose-700 font-bold">Ausente</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Sorteio Arena */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-white flex-grow">
        <div className="max-w-[1240px] mx-auto">
          {/* Sorteio Controls Banner */}
          <div className="bg-gradient-to-r from-[#0854A7] to-[#1EA8F5] text-white rounded-3xl p-6 md:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <div className="text-center md:text-left space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-[#FFC300]">
                Controle de Sorteio
              </span>
              <h3 className="font-['Nunito'] text-2xl md:text-3xl font-black">
                {winners.length === 0 ? 'Pronto para iniciar a premiação?' : 'Premiação Realizada!'}
              </h3>
              <p className="text-xs md:text-sm text-white/90">
                {winners.length === 0
                  ? registeredChildren.length === 0
                    ? 'Nenhuma criança cadastrada ainda. Registre novas crianças na página inicial para iniciar o sorteio.'
                    : registeredChildren.length === 1
                    ? '1 criança cadastrada. O sorteio contemplará este participante no 1º Lugar.'
                    : `Clique no botão para sortear os ${Math.min(registeredChildren.length, MAX_WINNERS)} ganhadores.`
                  : winners.length === 1
                  ? '1 ganhador sorteado com sucesso.'
                  : `${winners.length} ganhadores sorteados. Você pode substituir individualmente qualquer número em caso de ausência.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handlePerformDraw}
                disabled={isDrawing || registeredChildren.length === 0}
                className={`font-black text-sm px-8 py-4 rounded-2xl uppercase tracking-wider transition-all duration-200 shadow-lg flex items-center gap-3 cursor-pointer ${
                  isDrawing || registeredChildren.length === 0
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-[#FFC300] hover:bg-[#e6b000] active:scale-95 text-black hover:shadow-xl'
                }`}
              >
                <Sparkles className="w-5 h-5 text-black" />
                <span>
                  {isDrawing
                    ? 'Sorteando...'
                    : registeredChildren.length === 0
                    ? 'Cadastre Crianças para Sortear'
                    : winners.length === 0
                    ? registeredChildren.length === 1
                      ? 'Realizar Sorteio (1 Ganhador)'
                      : `Realizar Sorteio (${Math.min(registeredChildren.length, MAX_WINNERS)} Ganhadores)`
                    : registeredChildren.length === 1
                    ? 'Sortear Novamente (1 Ganhador)'
                    : `Sortear Novamente (${Math.min(registeredChildren.length, MAX_WINNERS)} Ganhadores)`}
                </span>
              </button>

              {onRefreshChildren && (
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing || isDrawing}
                  className="bg-white/15 hover:bg-white/25 active:scale-95 text-white font-black text-sm px-6 py-4 rounded-2xl uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2.5 border-2 border-white/40 cursor-pointer backdrop-blur-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Atualizar lista de participantes em tempo real"
                >
                  <RefreshCw className={`w-5 h-5 text-[#FFC300] ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>
                    {isRefreshing
                      ? 'Atualizando...'
                      : refreshMessage || 'Atualizar Lista'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Suspense Drawing Overlay / Animation */}
          {isDrawing && (
            <div className="my-10 p-10 bg-[#FFF3EB] border-4 border-[#FFC300] rounded-3xl text-center space-y-4 animate-pulse">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF2D78] text-white animate-spin">
                <RefreshCw className="w-8 h-8" />
              </div>
              <h3 className="font-['Nunito'] text-2xl md:text-3xl font-black text-[#0854A7]">
                Girando os números das credenciais...
              </h3>
              <div className="inline-block bg-white border-4 border-[#0854A7] px-8 py-4 rounded-2xl shadow-xl">
                <span className="font-mono text-3xl md:text-5xl font-black text-[#FF2D78] tracking-widest">
                  {displayCyclingNumber}
                </span>
              </div>
              <p className="text-sm font-bold text-[#0854A7]">
                {registeredChildren.length === 1
                  ? 'Sorteando o participante cadastrado do Dia das Crianças!'
                  : `Sorteando os ${Math.min(registeredChildren.length, MAX_WINNERS)} contemplados do Dia das Crianças!`}
              </p>
            </div>
          )}

          {/* Notification if recently replaced */}
          {recentReplacementNote && (
            <div className="mb-8 p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-emerald-900 flex items-center justify-between gap-3 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{recentReplacementNote}</span>
              </div>
              <button
                onClick={() => setRecentReplacementNote(null)}
                className="text-emerald-700 hover:text-emerald-950 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Empty State before Draw */}
          {winners.length === 0 && !isDrawing && (
            <div className="text-center py-16 px-6 bg-white border-2 border-dashed border-gray-200 rounded-3xl max-w-2xl mx-auto space-y-4">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FFF3EB] text-[#FF2D78] flex items-center justify-center shadow-xs">
                <Trophy className="w-10 h-10" />
              </div>
              <h3 className="font-['Nunito'] text-2xl font-black text-[#0854A7]">
                Nenhum sorteio realizado ainda
              </h3>
              <p className="text-sm text-[#2b2b2b] max-w-md mx-auto leading-relaxed">
                Temos <strong>{registeredChildren.length}</strong> {registeredChildren.length === 1 ? 'criança cadastrada pronta' : 'crianças cadastradas prontas'} para participar.
                {registeredChildren.length > 0 && ' Clique no botão acima para realizar o sorteio oficial.'}
              </p>
              {registeredChildren.length === 0 && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 font-bold max-w-md mx-auto space-y-2">
                  <p>A lista de participantes está zerada (0 cadastros).</p>
                  <button
                    type="button"
                    onClick={() => onNavigate('inicio')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0854A7] text-white rounded-xl text-xs font-bold hover:bg-[#064283] transition-colors cursor-pointer"
                  >
                    <span>Ir para o Formulário de Cadastro</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* The Winners Display */}
          {winners.length > 0 && !isDrawing && (
            <div className="space-y-8">
              {/* Header and Filter */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-[#0854A7]">
                    Resultado Oficial da Chamada
                  </span>
                  <h2 className="font-['Nunito'] text-2xl sm:text-3xl md:text-4xl font-black text-[#0854A7]">
                    {winners.length === 1 ? 'O Ganhador Sorteado (1º Lugar)' : `Os ${winners.length} Ganhadores Sorteados`}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    {winners.length === 1
                      ? 'Confira o participante contemplado na chamada oficial.'
                      : `Confira todos os números sorteados em ordem do 1º ao ${winners.length}º lugar.`}
                  </p>
                </div>

                {/* Filter / Search for quick checking */}
                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Localizar ganhador ou credencial..."
                    value={winnerSearchTerm}
                    onChange={(e) => setWinnerSearchTerm(e.target.value)}
                    className="w-full bg-white border-2 border-gray-200 rounded-full pl-10 pr-4 py-2 text-xs text-[#111827] focus:outline-hidden focus:border-[#0854A7]"
                  />
                </div>
              </div>

              {/* 20 Winners Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredWinners.map((winner) => {
                  const theme = getWinnerTheme(winner.place);
                  const wasReplaced = Boolean(winner.replacedFrom);

                  return (
                    <div
                      key={winner.place}
                      className={`relative bg-white border-2 ${theme.border} rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
                    >
                      {/* Top Header Badge */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`px-3 py-0.5 rounded-lg font-['Nunito'] text-xs uppercase tracking-wider shadow-2xs ${theme.badgeBg}`}
                          >
                            {theme.title}
                          </span>
                          <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                            {theme.icon}
                          </div>
                        </div>

                        {/* Credential Number Display */}
                        <div className="my-2.5 text-center py-2.5 px-3 bg-gray-50 rounded-xl border border-gray-100">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                            Credencial Sorteada
                          </span>
                          <span className="font-mono text-xl sm:text-2xl font-black text-[#0854A7] tracking-wider">
                            {winner.child.credentialCode}
                          </span>
                        </div>

                        {/* Child Details */}
                        <div className="space-y-1 text-center mb-3">
                          <h4 className="font-['Nunito'] font-extrabold text-base text-[#111827] line-clamp-1" title={winner.child.childName}>
                            {winner.child.childName}
                          </h4>
                          <p className="text-xs font-bold text-gray-600">
                            Idade: <span className="text-[#FF2D78]">{winner.child.age} anos</span>
                          </p>
                          {winner.child.guardianName && (
                            <p className="text-[11px] font-semibold text-gray-500 truncate" title={winner.child.guardianName}>
                              Resp: {winner.child.guardianName}
                            </p>
                          )}
                          {winner.child.cityNeighborhood && (
                            <p className="text-[10px] text-gray-400 truncate" title={winner.child.cityNeighborhood}>
                              📍 {winner.child.cityNeighborhood}
                            </p>
                          )}
                          <span className="inline-block text-[10px] text-gray-400 mt-0.5">
                            Sorteado às {winner.drawnAt}
                          </span>
                        </div>

                        {/* Replaced notice if applicable */}
                        {wasReplaced && (
                          <div className="bg-rose-50 border border-rose-200 rounded-xl p-2 text-left mb-2.5">
                            <span className="block text-[10px] font-bold text-rose-800">
                              ⚠️ Substituto por ausência:
                            </span>
                            <span className="text-[10px] text-rose-700 font-medium">
                              Anterior: {winner.replacedFrom?.credentialCode} ({winner.replacedFrom?.childName}) às {winner.replacedFrom?.replacedAt}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Action: Quick button to replace this specific winner */}
                      <div className="pt-2.5 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlaceForReplacement(winner.place);
                            setReplacementModalOpen(true);
                          }}
                          className="w-full bg-white hover:bg-rose-50 border border-rose-300 hover:border-rose-400 text-rose-700 font-bold text-[11px] py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Marcar Ausente / Substituir</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CRITICAL USER REQUIREMENT:
                  Botão embaixo do sorteio para substituição e novo sorteio
              */}
              <div className="bg-[#FFF3EB] border-2 border-[#FFC300] rounded-3xl p-6 md:p-8 shadow-sm flex flex-col items-center justify-center">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-3xl">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlaceForReplacement(null);
                      setModalSearchTerm('');
                      setReplacementModalOpen(true);
                    }}
                    className="w-full sm:flex-1 bg-[#FF2D78] hover:bg-[#e02069] active:scale-95 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-center"
                  >
                    <UserX className="w-4 h-4 shrink-0" />
                    <span>Sortear Substituto para Ausente</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePerformDraw}
                    disabled={isDrawing || registeredChildren.length === 0}
                    className={`w-full sm:flex-1 font-black text-sm px-6 py-3.5 rounded-2xl uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer text-center ${
                      isDrawing || registeredChildren.length === 0
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-[#0854A7] hover:bg-[#064283] active:scale-95 text-white hover:shadow-lg'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-[#FFC300] shrink-0" />
                    <span>Sortear Novamente</span>
                  </button>

                  {onRefreshChildren && (
                    <button
                      type="button"
                      onClick={handleRefresh}
                      disabled={isRefreshing || isDrawing}
                      className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-gray-50 text-[#0854A7] border-2 border-[#0854A7] font-black text-sm rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-50"
                      title="Atualizar lista de cadastrados em tempo real"
                    >
                      <RefreshCw className={`w-4 h-4 text-[#0854A7] ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Lista'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Substitution Audit Logs */}
              {replacementLogs.length > 0 && (
                <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
                  <h4 className="font-['Nunito'] font-black text-lg text-[#0854A7] mb-3 flex items-center gap-2">
                    <UserX className="w-4 h-4 text-[#FF2D78]" />
                    <span>Histórico de Substituições por Ausência ({replacementLogs.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {replacementLogs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0854A7] bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                            {log.place}º Lugar
                          </span>
                          <span className="text-rose-700 font-bold line-through">
                            {log.previousCredential} ({log.previousName})
                          </span>
                          <span className="text-gray-400">➔</span>
                          <span className="text-emerald-700 font-bold">
                            {log.newCredential} ({log.newName})
                          </span>
                        </div>
                        <span className="text-gray-500 text-[11px]">
                          Substituído às {log.timestamp} por ausência
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* MODAL DE SUBSTITUIÇÃO DE GANHADOR AUSENTE */}
      {replacementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border-4 border-[#FFC300] space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-[#0854A7]">
                <UserX className="w-6 h-6 text-[#FF2D78]" />
                <h3 className="font-['Nunito'] text-xl font-black">
                  Sortear Substituto de Ausente
                </h3>
              </div>
              <button
                onClick={() => {
                  setReplacementModalOpen(false);
                  setSelectedPlaceForReplacement(null);
                }}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#2b2b2b] leading-relaxed">
              Selecione abaixo qual dos {winners.length} {winners.length === 1 ? 'lugar' : 'lugares'} não respondeu à chamada para sortearmos um novo número substituto entre os participantes disponíveis:
            </p>

            {/* Quick search inside modal */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por colocação, nome ou credencial..."
                value={modalSearchTerm}
                onChange={(e) => setModalSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:border-[#0854A7]"
              />
            </div>

            {/* Place Selection Buttons Grid (Scrollable) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 overflow-y-auto pr-1 flex-grow max-h-72">
              {filteredModalWinners.map((w) => {
                const isSelected = selectedPlaceForReplacement === w.place;
                return (
                  <button
                    key={w.place}
                    type="button"
                    onClick={() => setSelectedPlaceForReplacement(w.place)}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#FF2D78] bg-pink-50 ring-2 ring-[#FF2D78]/30 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-[#1EA8F5]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-['Nunito'] font-black text-xs uppercase tracking-wider text-[#0854A7]">
                        {w.place}º Lugar
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#FF2D78]" />}
                    </div>
                    <span className="font-mono font-black text-xs text-[#0854A7] mt-0.5">
                      {w.child.credentialCode}
                    </span>
                    <span className="text-[11px] text-[#2b2b2b] truncate font-medium mt-0.5">
                      {w.child.childName}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500 font-medium">
                {selectedPlaceForReplacement
                  ? `Selecionado: ${selectedPlaceForReplacement}º Lugar`
                  : 'Nenhum lugar selecionado'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReplacementModalOpen(false);
                    setSelectedPlaceForReplacement(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={!selectedPlaceForReplacement}
                  onClick={() => {
                    if (selectedPlaceForReplacement) {
                      handleConfirmReplacement(selectedPlaceForReplacement);
                    }
                  }}
                  className={`px-5 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                    selectedPlaceForReplacement
                      ? 'bg-[#FF2D78] hover:bg-[#e02069] text-white active:scale-95'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sortear Substituto</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
