import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCxt-cVJ4R_SWuDF6m2JVOBsWK2LXHSn1Q",
  authDomain: "mpga-cadastro.firebaseapp.com",
  projectId: "mpga-cadastro",
  storageBucket: "mpga-cadastro.firebasestorage.app",
  messagingSenderId: "979797356332",
  appId: "1:979797356332:web:a32b03c58ff57b4d010689",
  measurementId: "G-VXDQQK8XN3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const INITIAL_CHILDREN = [
  {
    id: 'reg-001',
    sequenceNumber: 1,
    credentialCode: 'MPGA26-001',
    guardianName: 'Juliana dos Santos',
    childName: 'Lucas Gabriel dos Santos',
    birthDate: '2020-03-14',
    cityNeighborhood: 'São Paulo - Jd. Peri Peri',
    whatsappPhone: '(11) 98123-4567',
    referralSource: 'Redes Sociais (Instagram)',
    age: 6,
    registeredAt: '2026-09-20 10:15',
  },
  {
    id: 'reg-002',
    sequenceNumber: 2,
    credentialCode: 'MPGA26-002',
    guardianName: 'Marcos Paulo Castro',
    childName: 'Sophia Emanuelly Castro',
    birthDate: '2022-07-22',
    cityNeighborhood: 'São Paulo - Rio Pequeno',
    whatsappPhone: '(11) 97234-5678',
    referralSource: 'Amigos ou Familiares',
    age: 4,
    registeredAt: '2026-09-20 10:30',
  },
  {
    id: 'reg-003',
    sequenceNumber: 3,
    credentialCode: 'MPGA26-003',
    guardianName: 'Renata Barbosa',
    childName: 'Davi Lucca Barbosa',
    birthDate: '2019-11-05',
    cityNeighborhood: 'Osasco - Rochdale',
    whatsappPhone: '(11) 96345-6789',
    referralSource: 'Escola / Creche',
    age: 7,
    registeredAt: '2026-09-20 11:05',
  },
  {
    id: 'reg-004',
    sequenceNumber: 4,
    credentialCode: 'MPGA26-004',
    guardianName: 'Camila Vitória Lima',
    childName: 'Valentina Vitória Lima',
    birthDate: '2021-02-18',
    cityNeighborhood: 'São Paulo - Butantã',
    whatsappPhone: '(11) 95456-7890',
    referralSource: 'Cartaz / Faixa no Bairro',
    age: 5,
    registeredAt: '2026-09-20 11:40',
  },
  {
    id: 'reg-005',
    sequenceNumber: 5,
    credentialCode: 'MPGA26-005',
    guardianName: 'Carlos Eduardo Souza',
    childName: 'Enzo Gabriel Souza',
    birthDate: '2018-09-10',
    cityNeighborhood: 'São Paulo - Vila Sônia',
    whatsappPhone: '(11) 94567-8901',
    referralSource: 'Igreja / Comunidade Religiosa',
    age: 8,
    registeredAt: '2026-09-20 12:10',
  },
  {
    id: 'reg-006',
    sequenceNumber: 6,
    credentialCode: 'MPGA26-006',
    guardianName: 'Patrícia Nogueira',
    childName: 'Isabella Nogueira',
    birthDate: '2023-01-25',
    cityNeighborhood: 'São Paulo - Jd. Bonfiglioli',
    whatsappPhone: '(11) 93678-9012',
    referralSource: 'Amigos ou Familiares',
    age: 3,
    registeredAt: '2026-09-20 13:00',
  },
  {
    id: 'reg-007',
    sequenceNumber: 7,
    credentialCode: 'MPGA26-007',
    guardianName: 'Fernando Henrique Silva',
    childName: 'Matheus Henrique Silva',
    birthDate: '2017-06-30',
    cityNeighborhood: 'Taboão da Serra - Jd. Maria Rosa',
    whatsappPhone: '(11) 92789-0123',
    referralSource: 'Redes Sociais (Facebook)',
    age: 9,
    registeredAt: '2026-09-20 13:30',
  },
  {
    id: 'reg-008',
    sequenceNumber: 8,
    credentialCode: 'MPGA26-008',
    guardianName: 'Aline Cristina Mendes',
    childName: 'Helena Mendes',
    birthDate: '2024-04-12',
    cityNeighborhood: 'São Paulo - Campo Limpo',
    whatsappPhone: '(11) 91890-1234',
    referralSource: 'Posto de Saúde / UBS',
    age: 2,
    registeredAt: '2026-09-20 14:15',
  },
  {
    id: 'reg-009',
    sequenceNumber: 9,
    credentialCode: 'MPGA26-009',
    guardianName: 'Rodrigo Alves',
    childName: 'Bernardo Alves',
    birthDate: '2019-08-14',
    cityNeighborhood: 'São Paulo - Morumbi',
    whatsappPhone: '(11) 90901-2345',
    referralSource: 'Redes Sociais (Instagram)',
    age: 7,
    registeredAt: '2026-09-20 14:50',
  },
  {
    id: 'reg-010',
    sequenceNumber: 10,
    credentialCode: 'MPGA26-010',
    guardianName: 'Vanessa Ferreira',
    childName: 'Alice Ferreira',
    birthDate: '2021-12-03',
    cityNeighborhood: 'São Paulo - Caxingui',
    whatsappPhone: '(11) 99876-5432',
    referralSource: 'Amigos ou Familiares',
    age: 4,
    registeredAt: '2026-09-20 15:20',
  },
  {
    id: 'reg-011',
    sequenceNumber: 11,
    credentialCode: 'MPGA26-011',
    guardianName: 'Leandro Martins',
    childName: 'Heitor Martins',
    birthDate: '2020-05-19',
    cityNeighborhood: 'Cotia - Granja Viana',
    whatsappPhone: '(11) 98765-4321',
    referralSource: 'Escola / Creche',
    age: 6,
    registeredAt: '2026-09-20 15:45',
  },
  {
    id: 'reg-012',
    sequenceNumber: 12,
    credentialCode: 'MPGA26-012',
    guardianName: 'Tatiane Ribeiro',
    childName: 'Lorena Ribeiro',
    birthDate: '2022-10-08',
    cityNeighborhood: 'São Paulo - Jd. Colombo',
    whatsappPhone: '(11) 97654-3210',
    referralSource: 'Cartaz / Faixa no Bairro',
    age: 3,
    registeredAt: '2026-09-20 16:10',
  },
  {
    id: 'reg-013',
    sequenceNumber: 13,
    credentialCode: 'MPGA26-013',
    guardianName: 'Gustavo Pinheiro',
    childName: 'Theo Pinheiro',
    birthDate: '2023-08-01',
    cityNeighborhood: 'São Paulo - Vila Andrade',
    whatsappPhone: '(11) 96543-2109',
    referralSource: 'Redes Sociais (Instagram)',
    age: 3,
    registeredAt: '2026-09-20 16:40',
  },
  {
    id: 'reg-014',
    sequenceNumber: 14,
    credentialCode: 'MPGA26-014',
    guardianName: 'Mariana Duarte',
    childName: 'Laura Duarte',
    birthDate: '2018-04-29',
    cityNeighborhood: 'Osasco - Bela Vista',
    whatsappPhone: '(11) 95432-1098',
    referralSource: 'Amigos ou Familiares',
    age: 8,
    registeredAt: '2026-09-20 17:05',
  },
  {
    id: 'reg-015',
    sequenceNumber: 15,
    credentialCode: 'MPGA26-015',
    guardianName: 'Bruno Carvalho',
    childName: 'Pedro Carvalho',
    birthDate: '2019-01-15',
    cityNeighborhood: 'São Paulo - Butantã',
    whatsappPhone: '(11) 94321-0987',
    referralSource: 'Igreja / Comunidade Religiosa',
    age: 7,
    registeredAt: '2026-09-20 17:30',
  },
  {
    id: 'reg-016',
    sequenceNumber: 16,
    credentialCode: 'MPGA26-016',
    guardianName: 'Daniela Farias',
    childName: 'Manuela Farias',
    birthDate: '2021-06-11',
    cityNeighborhood: 'São Paulo - Rio Pequeno',
    whatsappPhone: '(11) 93210-9876',
    referralSource: 'Redes Sociais (Facebook)',
    age: 5,
    registeredAt: '2026-09-20 17:50',
  },
  {
    id: 'reg-017',
    sequenceNumber: 17,
    credentialCode: 'MPGA26-017',
    guardianName: 'Thiago Guimarães',
    childName: 'Gabriel Guimarães',
    birthDate: '2017-11-20',
    cityNeighborhood: 'São Paulo - Jd. D’Abril',
    whatsappPhone: '(11) 92109-8765',
    referralSource: 'Cartaz / Faixa no Bairro',
    age: 8,
    registeredAt: '2026-09-20 18:15',
  },
  {
    id: 'reg-018',
    sequenceNumber: 18,
    credentialCode: 'MPGA26-018',
    guardianName: 'Sabrina Toledo',
    childName: 'Júlia Toledo',
    birthDate: '2024-02-05',
    cityNeighborhood: 'Taboão da Serra - Centro',
    whatsappPhone: '(11) 91098-7654',
    referralSource: 'Posto de Saúde / UBS',
    age: 2,
    registeredAt: '2026-09-20 18:40',
  },
  {
    id: 'reg-019',
    sequenceNumber: 19,
    credentialCode: 'MPGA26-019',
    guardianName: 'Rafael Moreira',
    childName: 'Samuel Moreira',
    birthDate: '2020-09-27',
    cityNeighborhood: 'São Paulo - Jd. Peri Peri',
    whatsappPhone: '(11) 90987-6543',
    referralSource: 'Amigos ou Familiares',
    age: 6,
    registeredAt: '2026-09-20 19:00',
  },
  {
    id: 'reg-020',
    sequenceNumber: 20,
    credentialCode: 'MPGA26-020',
    guardianName: 'Priscila Ramos',
    childName: 'Lívia Ramos',
    birthDate: '2022-03-04',
    cityNeighborhood: 'São Paulo - Vila Sônia',
    whatsappPhone: '(11) 99887-7665',
    referralSource: 'Redes Sociais (Instagram)',
    age: 4,
    registeredAt: '2026-09-20 19:25',
  },
];

async function seed() {
  console.log('--- Testing Firestore Connection to mpga-cadastro ---');
  try {
    const colRef = collection(db, 'registered_children');
    const existingSnap = await getDocs(colRef);
    console.log(`Current documents count in registered_children: ${existingSnap.size}`);

    if (existingSnap.size === 0) {
      console.log('Populating initial 20 credentials in registered_children...');
      const batch = writeBatch(db);
      for (const child of INITIAL_CHILDREN) {
        const docRef = doc(db, 'registered_children', child.id);
        batch.set(docRef, {
          ...child,
          createdAt: serverTimestamp(),
        });
      }
      await batch.commit();
      console.log('Successfully seeded 20 registered_children documents!');
    } else {
      console.log('Collection registered_children already contains data.');
    }

    // Also initialize sorteio_state collection
    const sorteioDocRef = doc(db, 'sorteio_state', 'active');
    await setDoc(sorteioDocRef, {
      initialized: true,
      lastCheck: serverTimestamp(),
    }, { merge: true });
    console.log('sorteio_state initialized successfully.');

    console.log('--- All collections created and verified successfully! ---');
  } catch (error: any) {
    console.error('Firestore operation result:', error.code || error.message);
  }
}

seed();
