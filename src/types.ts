export type ScreenType = 'inicio' | 'sorteio';

export interface RegisteredChild {
  id: string;
  sequenceNumber: number; // 1 to 999
  credentialCode: string; // "MPGA26-001" to "MPGA26-999"
  guardianName?: string; // Nome do Responsável
  childName: string; // Nome da Criança
  birthDate?: string; // Data de Aniversário da Criança
  cityNeighborhood?: string; // Cidade / Bairro
  whatsappPhone?: string; // Telefone WhatsApp
  referralSource?: string; // Como Ficou Sabendo dessa Festa Beneficiente
  age: number;
  registeredAt: string;
}

export interface SorteioWinner {
  place: number; // 1 to 20
  child: RegisteredChild;
  drawnAt: string;
  replacedFrom?: {
    credentialCode: string;
    childName: string;
    replacedAt: string;
  };
}

export interface ReplacementLog {
  id: string;
  place: number; // 1 to 20
  previousCredential: string;
  previousName: string;
  newCredential: string;
  newName: string;
  timestamp: string;
}

export interface Child {
  id: string;
  childName: string;
  age: number;
  gender: 'Menino' | 'Menina' | 'Indiferente';
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  email?: string;
  neighborhood: string;
  password?: string;
  address?: string;
  toyPreference: string;
  wishDetails: string;
  status: 'aguardando' | 'apadrinhado' | 'entregue';
  protocolNumber: string;
  createdAt: string;
  sponsorName?: string;
  sponsorMessage?: string;
}

export interface DonationPledge {
  id: string;
  donorName: string;
  donorEmail?: string;
  donorPhone: string;
  type: 'brinquedos' | 'financeiro' | 'voluntario';
  toyQuantity?: number;
  toyCondition?: 'Novo' | 'Seminovo em ótimo estado';
  dropPointId?: string;
  dropPointName?: string;
  amount?: number;
  paymentMethod?: 'PIX' | 'Cartão' | 'Boleto';
  volunteerRole?: string;
  volunteerAvailability?: string;
  sponsoredChildId?: string;
  sponsoredChildName?: string;
  receiptNumber?: string;
  cpf?: string;
  message?: string;
  status: 'confirmado' | 'entregue';
  createdAt: string;
}

export interface DropPoint {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  hours: string;
  contactPhone: string;
  responsiblePerson: string;
  mapsQuery: string;
}

export interface TimelineMilestone {
  year: string;
  title: string;
  description: string;
  stat: string;
  statLabel: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  title: string;
  category: 'entregas' | 'brinquedos' | 'voluntarios' | 'sorrisos';
  year: string;
}
