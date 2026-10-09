/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScreenType, RegisteredChild } from './types';
import { formatCredentialCode } from './data/mockData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeScreen } from './components/screens/HomeScreen';
import { SorteioScreen } from './components/screens/SorteioScreen';
import { ConfirmResetModal } from './components/ConfirmResetModal';
import { Sparkles, X } from 'lucide-react';
import {
  subscribeToChildren,
  registerChildInFirestore,
  clearAllDataInFirestore,
  onFirebaseStatusChange,
  FirebaseSyncStatus,
} from './services/firebaseService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('inicio');
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);
  const [syncStatus, setSyncStatus] = useState<FirebaseSyncStatus>('connecting');
  const [resetModalOpen, setResetModalOpen] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Local storage cache for instant offline load - starts empty (0 registrations) unless real ones exist
  const [registeredChildren, setRegisteredChildren] = useState<RegisteredChild[]>(() => {
    try {
      const saved = localStorage.getItem('mpga_registered_children');
      if (saved) {
        const parsed: RegisteredChild[] = JSON.parse(saved);
        // Clean out mock records (like initial reg-001 or Lucas Gabriel dos Santos) so it starts fresh from 0
        const isMockData = parsed.length > 0 && (parsed[0]?.id === 'reg-001' || parsed[0]?.childName === 'Lucas Gabriel dos Santos');
        if (!isMockData && Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => ({
            ...item,
            credentialCode: item.credentialCode.includes('-MPGA26')
              ? formatCredentialCode(item.sequenceNumber)
              : item.credentialCode,
          }));
        }
      }
    } catch (e) {
      console.error('Error loading registered children from cache', e);
    }
    // Default to clean empty list so sequence starts fresh from MPGA26-001
    return [];
  });

  // Track Firebase connection status
  useEffect(() => {
    const unsubStatus = onFirebaseStatusChange((status) => {
      setSyncStatus(status);
    });
    return () => unsubStatus();
  }, []);

  // Keep local storage cache updated for offline resilience
  useEffect(() => {
    try {
      localStorage.setItem('mpga_registered_children', JSON.stringify(registeredChildren));
    } catch (e) {
      console.error('Failed to persist registered children to localStorage', e);
    }
  }, [registeredChildren]);

  // Firebase Real-time Firestore synchronization
  useEffect(() => {
    const unsubscribe = subscribeToChildren(
      (firestoreChildren) => {
        // Filter out any lingering mock records if present
        const cleanChildren = firestoreChildren.filter(
          (c) => c.id !== 'reg-001' && c.childName !== 'Lucas Gabriel dos Santos'
        );
        setRegisteredChildren(cleanChildren);
      },
      (error) => {
        console.warn('Firebase sync status note:', error.message);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      setRegisteredChildren([]);
      localStorage.removeItem('mpga_registered_children');
      localStorage.removeItem('mpga_sorteio_winners_v20');
      localStorage.removeItem('mpga_sorteio_absent_ids_v20');
      localStorage.removeItem('mpga_sorteio_replacement_logs_v20');
      await clearAllDataInFirestore();
      showToast('Cadastros Zerados!', 'A lista foi reiniciada. O próximo registro começará na credencial MPGA26-001.');
    } catch (e: any) {
      console.error('Error clearing data', e);
      showToast('Aviso', 'A lista local foi zerada. Verifique a conexão com o Firebase.');
    } finally {
      setIsResetting(false);
      setResetModalOpen(false);
    }
  };

  const handleAddChild = (childData: {
    guardianName: string;
    childName: string;
    birthDate: string;
    cityNeighborhood: string;
    whatsappPhone: string;
    referralSource: string;
    age: number;
  }): RegisteredChild | null => {
    const nextSeq = registeredChildren.length + 1;
    if (nextSeq > 999) {
      showToast('Limite Atingido', 'O limite de 999 credenciais (MPGA26-999) já foi alcançado.');
      return null;
    }

    const code = formatCredentialCode(nextSeq);
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const optimisticChild: RegisteredChild = {
      id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sequenceNumber: nextSeq,
      credentialCode: code,
      guardianName: childData.guardianName,
      childName: childData.childName,
      birthDate: childData.birthDate,
      cityNeighborhood: childData.cityNeighborhood,
      whatsappPhone: childData.whatsappPhone,
      referralSource: childData.referralSource,
      age: childData.age,
      registeredAt: formattedDate,
    };

    // Update local state immediately for instant responsive UX
    setRegisteredChildren((prev) => [...prev, optimisticChild]);
    showToast('Registro Concluído!', `Credencial ${code} gerada para ${childData.childName}.`);

    // Persist to Firebase Firestore asynchronously without blocking or failing
    registerChildInFirestore(childData, registeredChildren.length)
      .then((res) => {
        if (res.syncedToCloud) {
          console.log(`Saved to Firestore successfully: ${res.child.credentialCode}`);
        } else {
          console.log(`Saved to local cache, Firestore status: ${syncStatus}`);
        }
      })
      .catch((error) => {
        console.warn('Handled registration sync:', error.message);
      });

    return optimisticChild;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1f2937]">
      {/* Top Navbar */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
      />

      {/* Dynamic Screen View */}
      <main className="flex-grow bg-white">
        {currentScreen === 'inicio' && (
          <HomeScreen
            registeredChildren={registeredChildren}
            onAddChild={handleAddChild}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onResetChildren={() => setResetModalOpen(true)}
          />
        )}

        {currentScreen === 'sorteio' && (
          <SorteioScreen
            registeredChildren={registeredChildren}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onResetChildren={() => setResetModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(screen) => setCurrentScreen(screen)}
      />

      {/* Confirmation Modal to Reset/Zero Registrations */}
      <ConfirmResetModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        isResetting={isResetting}
        totalChildren={registeredChildren.length}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0854A7] text-white p-4 rounded-2xl shadow-xl border-2 border-[#FFC300] flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 max-w-sm">
          <div className="w-9 h-9 rounded-full bg-[#FF2D78] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm font-['Nunito'] text-white">
              {toastMessage.title}
            </h4>
            <p className="text-xs text-white/90 mt-0.5">{toastMessage.desc}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/70 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
