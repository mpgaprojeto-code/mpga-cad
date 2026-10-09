import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { RegisteredChild, SorteioWinner, ReplacementLog } from '../types';
import { formatCredentialCode, INITIAL_REGISTERED_CHILDREN } from '../data/mockData';

export const CHILDREN_COLLECTION = 'registered_children';
export const SORTEIO_DOC_PATH = 'sorteio_state/active';

export type FirebaseSyncStatus = 'connected' | 'permission_denied' | 'connecting' | 'offline';

let currentSyncStatus: FirebaseSyncStatus = 'connecting';
const statusListeners: Set<(status: FirebaseSyncStatus) => void> = new Set();

export function onFirebaseStatusChange(callback: (status: FirebaseSyncStatus) => void): () => void {
  statusListeners.add(callback);
  callback(currentSyncStatus);
  return () => statusListeners.delete(callback);
}

function updateStatus(newStatus: FirebaseSyncStatus) {
  if (currentSyncStatus !== newStatus) {
    currentSyncStatus = newStatus;
    statusListeners.forEach((fn) => fn(newStatus));
  }
}

/**
 * Subscribes to real-time updates of registered children from Firestore.
 */
export function subscribeToChildren(
  onUpdate: (children: RegisteredChild[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  try {
    const q = query(collection(db, CHILDREN_COLLECTION), orderBy('sequenceNumber', 'asc'));
    
    return onSnapshot(
      q,
      (snapshot) => {
        updateStatus('connected');
        const list: RegisteredChild[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            sequenceNumber: data.sequenceNumber ?? 0,
            credentialCode: data.credentialCode ?? formatCredentialCode(data.sequenceNumber || 1),
            guardianName: data.guardianName || '',
            childName: data.childName || '',
            birthDate: data.birthDate || '',
            cityNeighborhood: data.cityNeighborhood || '',
            whatsappPhone: data.whatsappPhone || '',
            referralSource: data.referralSource || '',
            age: data.age ?? 0,
            registeredAt: data.registeredAt || new Date().toISOString(),
          });
        });
        onUpdate(list);
      },
      (error) => {
        if (error.code === 'permission-denied') {
          console.warn('Firebase Firestore: permission-denied. Please publish security rules in Firebase Console.');
          updateStatus('permission_denied');
        } else {
          console.warn('Firestore snapshot error for children:', error.message);
          updateStatus('offline');
        }
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn('Failed to setup Firestore listener:', err);
    updateStatus('offline');
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Fetches all registered children once directly from Firestore.
 */
export async function fetchAllChildrenOnce(): Promise<RegisteredChild[]> {
  try {
    const q = query(collection(db, CHILDREN_COLLECTION), orderBy('sequenceNumber', 'asc'));
    const snapshot = await getDocs(q);
    updateStatus('connected');
    const list: RegisteredChild[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        sequenceNumber: data.sequenceNumber ?? 0,
        credentialCode: data.credentialCode ?? formatCredentialCode(data.sequenceNumber || 1),
        guardianName: data.guardianName || '',
        childName: data.childName || '',
        birthDate: data.birthDate || '',
        cityNeighborhood: data.cityNeighborhood || '',
        whatsappPhone: data.whatsappPhone || '',
        referralSource: data.referralSource || '',
        age: data.age ?? 0,
        registeredAt: data.registeredAt || new Date().toISOString(),
      });
    });
    return list;
  } catch (err: any) {
    console.warn('Failed to fetch children once:', err);
    if (err.code === 'permission-denied') {
      updateStatus('permission_denied');
    } else {
      updateStatus('offline');
    }
    throw err;
  }
}

/**
 * Register a new child in Firestore.
 * Always resolves successfully: if Firestore is temporarily permission-denied or offline,
 * it returns the local record so the UI and credentials flow continue seamlessly!
 */
export async function registerChildInFirestore(
  childData: {
    guardianName: string;
    childName: string;
    birthDate: string;
    cityNeighborhood: string;
    whatsappPhone: string;
    referralSource: string;
    age: number;
  },
  existingChildrenCount: number
): Promise<{ child: RegisteredChild; syncedToCloud: boolean; error?: string }> {
  const nextSeq = existingChildrenCount + 1;
  if (nextSeq > 999) {
    throw new Error('O limite máximo de 999 credenciais (MPGA26-999) foi atingido.');
  }

  const code = formatCredentialCode(nextSeq);
  const now = new Date();
  const formattedDate = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

  const docId = `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const childRecord: RegisteredChild = {
    id: docId,
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

  try {
    const docRef = doc(db, CHILDREN_COLLECTION, docId);
    await setDoc(docRef, {
      ...childRecord,
      createdAt: serverTimestamp(),
    });
    updateStatus('connected');
    return { child: childRecord, syncedToCloud: true };
  } catch (e: any) {
    if (e.code === 'permission-denied') {
      updateStatus('permission_denied');
    } else {
      updateStatus('offline');
    }
    console.warn('Could not immediately sync new child to Firestore, saved to local cache:', e.message);
    return { child: childRecord, syncedToCloud: false, error: e.message };
  }
}

/**
 * Seeds initial demo children to Firestore if collection is empty.
 */
export async function seedInitialChildrenIfEmpty(): Promise<{ success: boolean; message: string }> {
  try {
    const existingSnap = await getDocs(collection(db, CHILDREN_COLLECTION));
    if (!existingSnap.empty) {
      updateStatus('connected');
      return { success: true, message: `Coleção já contém ${existingSnap.size} registros.` };
    }

    const batch = writeBatch(db);
    INITIAL_REGISTERED_CHILDREN.forEach((child) => {
      const docRef = doc(db, CHILDREN_COLLECTION, child.id);
      batch.set(docRef, {
        ...child,
        createdAt: serverTimestamp(),
      });
    });

    await batch.commit();
    updateStatus('connected');
    return { success: true, message: '20 credenciais iniciais gravadas com sucesso no Firestore!' };
  } catch (e: any) {
    if (e.code === 'permission-denied') {
      updateStatus('permission_denied');
      return { success: false, message: 'Permissão negada no Firestore (necessário liberar Regras no console).' };
    }
    updateStatus('offline');
    return { success: false, message: e.message || 'Erro ao conectar ao Firestore.' };
  }
}

/**
 * Subscribes to Sorteio state in Firestore so all devices stay in sync.
 */
export function subscribeToSorteioState(
  onUpdate: (data: {
    winners: SorteioWinner[];
    absentIds: string[];
    replacementLogs: ReplacementLog[];
  } | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  try {
    const docRef = doc(db, SORTEIO_DOC_PATH);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          onUpdate({
            winners: data.winners || [],
            absentIds: data.absentIds || [],
            replacementLogs: data.replacementLogs || [],
          });
        } else {
          onUpdate(null);
        }
      },
      (error) => {
        if (error.code === 'permission-denied') {
          updateStatus('permission_denied');
        }
        console.warn('Firestore Sorteio snapshot note:', error.message);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn('Failed to subscribe to Sorteio state:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Saves Sorteio state to Firestore.
 */
export async function saveSorteioStateToFirestore(
  winners: SorteioWinner[],
  absentIds: string[],
  replacementLogs: ReplacementLog[]
): Promise<boolean> {
  try {
    const docRef = doc(db, SORTEIO_DOC_PATH);
    await setDoc(docRef, {
      winners,
      absentIds,
      replacementLogs,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (e: any) {
    if (e.code === 'permission-denied') {
      updateStatus('permission_denied');
    }
    console.warn('Error saving sorteio state to Firestore (persisted locally):', e.message);
    return false;
  }
}

/**
 * Clears all registered children and resets sorteio state in Firestore
 */
export async function clearAllDataInFirestore(): Promise<{ success: boolean; message: string }> {
  try {
    const snap = await getDocs(collection(db, CHILDREN_COLLECTION));
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
    }

    // Reset sorteio state doc
    const sorteioRef = doc(db, SORTEIO_DOC_PATH);
    await setDoc(sorteioRef, {
      winners: [],
      absentIds: [],
      replacementLogs: [],
      updatedAt: serverTimestamp(),
    });

    return { success: true, message: 'Cadastros e sorteio zerados com sucesso no Firestore!' };
  } catch (e: any) {
    console.warn('Could not clear Firestore data (using local reset):', e.message);
    return { success: false, message: e.message || 'Erro ao zerar no Firestore.' };
  }
}

