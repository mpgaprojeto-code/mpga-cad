import React, { useState } from 'react';
import { RegisteredChild, ScreenType } from '../../types';
import { formatCredentialCode } from '../../data/mockData';
import {
  Baby,
  Sparkles,
  Calendar,
  Search,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Hash,
  User,
  UserCheck,
  PlusCircle,
  AlertCircle,
  MapPin,
  Phone,
  Megaphone
} from 'lucide-react';

interface HomeScreenProps {
  registeredChildren: RegisteredChild[];
  onAddChild: (data: {
    guardianName: string;
    childName: string;
    birthDate: string;
    cityNeighborhood: string;
    whatsappPhone: string;
    referralSource: string;
    age: number;
  }) => RegisteredChild | null;
  onNavigate: (screen: ScreenType) => void;
  onResetChildren?: () => void;
  onRefreshChildren?: () => Promise<number | void> | void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  registeredChildren,
  onAddChild,
  onNavigate,
  onResetChildren,
  onRefreshChildren,
}) => {
  // Form fields in exact required order:
  // 1. Nome do Responsável
  const [guardianName, setGuardianName] = useState('');
  // 2. Nome da Criança
  const [childName, setChildName] = useState('');
  // 3. Data de Aniversário da Criança
  const [birthDate, setBirthDate] = useState('');
  // 4. Cidade / Bairro
  const [cityNeighborhood, setCityNeighborhood] = useState('');
  // 5. Telefone WhatsApp
  const [whatsappPhone, setWhatsappPhone] = useState('');
  // 6. Como Ficou Sabendo dessa Festa Beneficiente
  const [referralSource, setReferralSource] = useState('');
  const [customReferral, setCustomReferral] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [justRegistered, setJustRegistered] = useState<RegisteredChild | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Compute next credential code
  const nextSequence = registeredChildren.length + 1;
  const isLimitReached = nextSequence > 999;
  const nextCredentialDisplay = isLimitReached ? 'Limite MPGA26-999' : formatCredentialCode(nextSequence);

  // Calculate age from birthDate
  const calculateAge = (dateStr: string): number => {
    if (!dateStr) return 0;
    const birth = new Date(dateStr + 'T12:00:00');
    if (isNaN(birth.getTime())) return 0;
    const today = new Date();
    let calcAge = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      calcAge--;
    }
    return Math.max(0, calcAge);
  };

  const calculatedAge = calculateAge(birthDate);

  // Phone masking
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 0) {
      if (raw.length <= 2) {
        formatted = `(${raw}`;
      } else if (raw.length <= 6) {
        formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
      } else if (raw.length <= 10) {
        formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 6)}-${raw.slice(6)}`;
      } else {
        formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7, 11)}`;
      }
    }
    setWhatsappPhone(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Nome do Responsável validation
    if (!guardianName.trim()) {
      setFormError('Por favor, informe o Nome do Responsável.');
      return;
    }

    // 2. Nome da Criança validation
    if (!childName.trim()) {
      setFormError('Por favor, informe o Nome da Criança.');
      return;
    }

    // 3. Data de Aniversário da Criança validation
    if (!birthDate) {
      setFormError('Por favor, selecione a Data de Aniversário da Criança.');
      return;
    }

    // 4. Cidade / Bairro validation
    if (!cityNeighborhood.trim()) {
      setFormError('Por favor, informe a Cidade / Bairro.');
      return;
    }

    // 5. Telefone WhatsApp validation
    if (!whatsappPhone.trim()) {
      setFormError('Por favor, informe o Telefone WhatsApp para contato.');
      return;
    }

    // 6. Como Ficou Sabendo validation
    const finalReferral = referralSource === 'Outro canal' ? customReferral.trim() || 'Outro canal' : referralSource;
    if (!finalReferral) {
      setFormError('Por favor, selecione Como Ficou Sabendo dessa Festa Beneficiente.');
      return;
    }

    if (isLimitReached) {
      setFormError('O limite máximo de 999 credenciais (MPGA26-999) foi atingido.');
      return;
    }

    const newRegistration = onAddChild({
      guardianName: guardianName.trim(),
      childName: childName.trim(),
      birthDate,
      cityNeighborhood: cityNeighborhood.trim(),
      whatsappPhone: whatsappPhone.trim(),
      referralSource: finalReferral,
      age: calculatedAge,
    });

    if (newRegistration) {
      setJustRegistered(newRegistration);
      setGuardianName('');
      setChildName('');
      setBirthDate('');
      setCityNeighborhood('');
      setWhatsappPhone('');
      setReferralSource('');
      setCustomReferral('');

      setTimeout(() => {
        setJustRegistered(null);
      }, 6000);
    }
  };

  // Ensure sequential order (1, 2, 3, ...)
  const sequentialList = [...registeredChildren].sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  const filteredChildren = sequentialList.filter((c) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      c.childName.toLowerCase().includes(term) ||
      (c.guardianName && c.guardianName.toLowerCase().includes(term)) ||
      (c.cityNeighborhood && c.cityNeighborhood.toLowerCase().includes(term)) ||
      (c.whatsappPhone && c.whatsappPhone.includes(term)) ||
      (c.referralSource && c.referralSource.toLowerCase().includes(term)) ||
      c.credentialCode.toLowerCase().includes(term) ||
      String(c.age).includes(term)
    );
  });

  return (
    <div className="w-full flex flex-col bg-white">
      {/* 1. Header Banner */}
      <section className="pt-10 pb-8 px-4 md:px-8 bg-white border-b border-gray-100">
        <div className="max-w-[1240px] mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#FFF3EB] border border-[#FFC300] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-[#0854A7]">
            <Sparkles className="w-4 h-4 text-[#FF2D78]" />
            <span>Meu Pequeno Grande Amigo • Dia das Crianças</span>
          </div>

          <h1 className="font-['Nunito'] text-3xl sm:text-4xl md:text-5xl font-black text-[#0854A7] leading-tight">
            Cadastro e Credenciamento
          </h1>
        </div>
      </section>

      {/* 2. Registration Form and Next Credential Section */}
      <section className="py-10 px-4 md:px-8 bg-[#FFF9F5] border-b border-[#FDD4B8]">
        <div className="max-w-[900px] mx-auto">
          {/* Success Banner upon registration */}
          {justRegistered && (
            <div className="mb-6 p-4 md:p-5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base font-['Nunito'] text-emerald-900">
                    Registro Concluído com Sucesso!
                  </h4>
                  <p className="text-xs text-emerald-800">
                    <strong>{justRegistered.childName}</strong> ({justRegistered.age} anos) recebeu a credencial{' '}
                    <span className="font-mono font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                      {justRegistered.credentialCode}
                    </span>
                    {justRegistered.guardianName && (
                      <span className="ml-1 text-emerald-900">
                        • Responsável: <strong>{justRegistered.guardianName}</strong>
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Registration Form Card */}
          <div className="bg-white border-2 border-[#1EA8F5]/30 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0854A7] text-white flex items-center justify-center">
                  <Baby className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-['Nunito'] font-black text-xl sm:text-2xl text-[#0854A7]">
                    Formulário de Cadastro
                  </h2>
                  <p className="text-xs sm:text-sm text-[#2b2b2b]">
                    Preencha os dados abaixo para gerar a credencial oficial
                  </p>
                </div>
              </div>

              {/* Next Credential Badge */}
              <div className="bg-[#FFF3EB] border-2 border-[#FFC300] px-4 py-2.5 rounded-2xl text-center shrink-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-600">
                  Próxima Credencial
                </span>
                <span className="font-mono font-black text-lg text-[#FF2D78]">
                  {nextCredentialDisplay}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center justify-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Firebase Online
                </span>
              </div>
            </div>

            {formError && (
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* FORM IN EXACT REQUESTED SEQUENCE:
                1. Nome do Responsável
                2. Nome da Criança
                3. Data de Aniversário da Criança
                4. Cidade / Bairro
                5. Telefone WhatsApp
                6. Como Ficou Sabendo dessa Festa Beneficiente
            */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Nome do Responsável */}
                <div className="space-y-2">
                  <label htmlFor="guardianName" className="block text-sm font-bold text-[#0854A7]">
                    1. Nome do Responsável <span className="text-[#FF2D78]">*</span>
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      id="guardianName"
                      type="text"
                      placeholder="Ex: Maria de Fátima Silva"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      disabled={isLimitReached}
                      className="w-full bg-white border-2 border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-gray-900 focus:outline-hidden focus:border-[#0854A7] transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* 2. Nome da Criança */}
                <div className="space-y-2">
                  <label htmlFor="childName" className="block text-sm font-bold text-[#0854A7]">
                    2. Nome da Criança <span className="text-[#FF2D78]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      id="childName"
                      type="text"
                      placeholder="Ex: Pedro Henrique Silva"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      disabled={isLimitReached}
                      className="w-full bg-white border-2 border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-gray-900 focus:outline-hidden focus:border-[#0854A7] transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* 3. Data de Aniversário da Criança */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="birthDate" className="block text-sm font-bold text-[#0854A7]">
                      3. Data de Aniversário da Criança <span className="text-[#FF2D78]">*</span>
                    </label>
                    {birthDate && (
                      <span className="text-xs font-black text-[#FF2D78] bg-[#FFF3EB] border border-[#FFC300] px-2.5 py-0.5 rounded-full">
                        {calculatedAge} {calculatedAge === 1 ? 'ano' : 'anos'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBirthDate(e.target.value)}
                      disabled={isLimitReached}
                      className="w-full bg-white border-2 border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-gray-900 focus:outline-hidden focus:border-[#0854A7] transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* 4. Cidade / Bairro */}
                <div className="space-y-2">
                  <label htmlFor="cityNeighborhood" className="block text-sm font-bold text-[#0854A7]">
                    4. Cidade / Bairro <span className="text-[#FF2D78]">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      id="cityNeighborhood"
                      type="text"
                      placeholder="Ex: São Paulo - Jardim das Flores"
                      value={cityNeighborhood}
                      onChange={(e) => setCityNeighborhood(e.target.value)}
                      disabled={isLimitReached}
                      className="w-full bg-white border-2 border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-gray-900 focus:outline-hidden focus:border-[#0854A7] transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* 5. Telefone WhatsApp */}
                <div className="space-y-2">
                  <label htmlFor="whatsappPhone" className="block text-sm font-bold text-[#0854A7]">
                    5. Telefone WhatsApp <span className="text-[#FF2D78]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-emerald-600 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      id="whatsappPhone"
                      type="tel"
                      placeholder="Ex: (11) 98765-4321"
                      value={whatsappPhone}
                      onChange={handlePhoneChange}
                      disabled={isLimitReached}
                      className="w-full bg-white border-2 border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-gray-900 focus:outline-hidden focus:border-[#0854A7] transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* 6. Como Ficou Sabendo dessa Festa Beneficiente */}
                <div className="space-y-2">
                  <label htmlFor="referralSource" className="block text-sm font-bold text-[#0854A7]">
                    6. Como Ficou Sabendo dessa Festa Beneficiente <span className="text-[#FF2D78]">*</span>
                  </label>
                  <div className="relative">
                    <Megaphone className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="referralSource"
                      value={referralSource}
                      onChange={(e) => setReferralSource(e.target.value)}
                      disabled={isLimitReached}
                      className="w-full bg-white border-2 border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-gray-900 focus:outline-hidden focus:border-[#0854A7] transition-colors appearance-none cursor-pointer"
                      required
                    >
                      <option value="">Selecione uma opção...</option>
                      <option value="Redes Sociais (Instagram / Facebook / TikTok)">Redes Sociais (Instagram / Facebook / TikTok)</option>
                      <option value="Grupos de WhatsApp">Grupos de WhatsApp</option>
                      <option value="Amigos ou Familiares">Amigos ou Familiares</option>
                      <option value="Escola ou Creche">Escola ou Creche</option>
                      <option value="Cartaz / Faixa no Bairro">Cartaz / Faixa no Bairro</option>
                      <option value="Igreja ou Comunidade Local">Igreja ou Comunidade Local</option>
                      <option value="Já participei em edições anteriores">Já participei em edições anteriores</option>
                      <option value="Outro canal">Outro canal</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Extra input if "Outro canal" selected */}
              {referralSource === 'Outro canal' && (
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Conte-nos por onde ficou sabendo..."
                    value={customReferral}
                    onChange={(e) => setCustomReferral(e.target.value)}
                    className="w-full bg-white border-2 border-[#1EA8F5]/50 rounded-2xl px-4 py-2.5 text-sm text-gray-900 focus:outline-hidden focus:border-[#0854A7]"
                  />
                </div>
              )}

              {/* Botão de Enviar Registro */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Formato de credencial: <span className="font-mono font-bold text-gray-700">MPGA26-001</span> até{' '}
                  <span className="font-mono font-bold text-gray-700">MPGA26-999</span>.
                </p>

                <button
                  type="submit"
                  disabled={isLimitReached}
                  className={`w-full sm:w-auto font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    isLimitReached
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#FF2D78] hover:bg-[#e02069] active:scale-95 text-white hover:shadow-lg'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Enviar Registro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 3. Sequential Registered Children Display */}
      <section className="py-10 md:py-14 px-4 md:px-8 bg-white flex-grow">
        <div className="max-w-[1240px] mx-auto">
          {/* Header & Sorteio Quick Access CTA */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#1EA8F5]/10 border border-[#1EA8F5]/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#0854A7] mb-2">
                <Hash className="w-3.5 h-3.5 text-[#1EA8F5]" />
                <span>Ordem Sequencial de Cadastro</span>
              </div>
              <h2 className="font-['Nunito'] text-2xl sm:text-3xl md:text-4xl font-black text-[#0854A7]">
                Credenciais Cadastradas
              </h2>
              <p className="text-sm md:text-base text-[#2b2b2b] mt-1 max-w-xl">
                Visualização de cada criança cadastrada em ordem estritamente sequencial com sua respectiva credencial.
              </p>
            </div>

            {/* Quick Sorteio CTA Banner */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#FFF3EB] border-2 border-[#FFC300] p-3.5 rounded-2xl shadow-xs">
              <div>
                <span className="block text-xs font-black uppercase text-[#0854A7]">
                  Total: {registeredChildren.length} Cadastradas
                </span>
                <span className="text-xs text-gray-600">
                  Pronto para a entrega dos prêmios?
                </span>
              </div>
              <button
                onClick={() => {
                  onNavigate('sorteio');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-[#0854A7] hover:bg-[#064283] active:scale-95 text-white font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Trophy className="w-4 h-4 text-[#FFC300]" />
                <span>Ir para o Sorteio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar por criança, responsável, bairro ou credencial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border-2 border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm text-[#111827] focus:outline-hidden focus:border-[#0854A7]"
              />
            </div>
          </div>

          {/* Empty State */}
          {filteredChildren.length === 0 ? (
            <div className="text-center py-10 bg-[#FFF3EB] border border-[#FDD4B8] rounded-3xl p-8 max-w-md mx-auto">
              <Baby className="w-12 h-12 text-[#0854A7]/40 mx-auto mb-3" />
              <p className="font-bold text-lg text-[#0854A7] font-['Nunito']">
                Nenhum cadastro encontrado
              </p>
              <p className="text-xs text-[#2b2b2b] mt-1">
                {searchTerm
                  ? 'Nenhum resultado corresponde aos termos da pesquisa.'
                  : 'Utilize o formulário acima para registrar a primeira criança da lista.'}
              </p>
            </div>
          ) : (
            /* Registered Children List Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredChildren.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 hover:border-[#1EA8F5] rounded-2xl p-3.5 transition-all duration-150 hover:shadow-xs flex flex-col justify-between gap-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black bg-[#1EA8F5]/10 text-[#0854A7] px-2.5 py-1 rounded-md border border-[#1EA8F5]/25 shrink-0">
                      {item.credentialCode}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 shrink-0">
                      #{item.sequenceNumber}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-['Nunito'] font-extrabold text-sm text-[#111827] truncate" title={item.childName}>
                      {item.childName}
                    </h4>
                    <div className="flex items-center gap-2 text-xs mt-0.5">
                      <span className="font-bold text-[#FF2D78]">
                        {item.age} {item.age === 1 ? 'ano' : 'anos'}
                      </span>
                      {item.birthDate && (
                        <span className="text-[11px] text-gray-500">
                          • Nasc: {item.birthDate.split('-').reverse().join('/')}
                        </span>
                      )}
                    </div>
                  </div>

                  {(item.guardianName || item.cityNeighborhood || item.whatsappPhone) && (
                    <div className="text-[11px] text-gray-600 border-t border-gray-100 pt-2 space-y-1">
                      {item.guardianName && (
                        <p className="truncate" title={item.guardianName}>
                          <span className="font-semibold text-gray-400">Resp:</span> {item.guardianName}
                        </p>
                      )}
                      {item.cityNeighborhood && (
                        <p className="truncate text-gray-500" title={item.cityNeighborhood}>
                          <span className="text-gray-400">📍</span> {item.cityNeighborhood}
                        </p>
                      )}
                      {item.whatsappPhone && (
                        <p className="truncate text-emerald-700 font-semibold" title={item.whatsappPhone}>
                          <span>💬</span> {item.whatsappPhone}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
