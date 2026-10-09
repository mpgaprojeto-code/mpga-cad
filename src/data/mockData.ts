import { Child, DropPoint, GalleryPhoto, TimelineMilestone, RegisteredChild } from '../types';

export function formatCredentialCode(sequence: number): string {
  const padded = String(sequence).padStart(3, '0');
  return `MPGA26-${padded}`;
}

export const INITIAL_REGISTERED_CHILDREN: RegisteredChild[] = [
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
    guardianName: 'Rodrigo Carvalho',
    childName: 'Enzo Miguel Carvalho',
    birthDate: '2018-08-30',
    cityNeighborhood: 'São Paulo - Jaguaré',
    whatsappPhone: '(11) 94567-8901',
    referralSource: 'Igreja / Comunidade',
    age: 8,
    registeredAt: '2026-09-20 14:20',
  },
  {
    id: 'reg-006',
    sequenceNumber: 6,
    credentialCode: 'MPGA26-006',
    guardianName: 'Fernanda Ferreira',
    childName: 'Alice Helena Ferreira',
    birthDate: '2017-04-12',
    cityNeighborhood: 'São Paulo - Bonfiglioli',
    whatsappPhone: '(11) 93678-9012',
    referralSource: 'Redes Sociais (WhatsApp)',
    age: 9,
    registeredAt: '2026-09-20 15:10',
  },
  {
    id: 'reg-007',
    sequenceNumber: 7,
    credentialCode: 'MPGA26-007',
    guardianName: 'André Ribeiro',
    childName: 'Arthur Bernardo Ribeiro',
    birthDate: '2020-09-08',
    cityNeighborhood: 'Taboão da Serra - Centro',
    whatsappPhone: '(11) 92789-0123',
    referralSource: 'Amigos ou Familiares',
    age: 6,
    registeredAt: '2026-09-20 16:00',
  },
  {
    id: 'reg-008',
    sequenceNumber: 8,
    credentialCode: 'MPGA26-008',
    guardianName: 'Beatriz Ramos',
    childName: 'Heloísa Beatriz Ramos',
    birthDate: '2019-12-25',
    cityNeighborhood: 'São Paulo - Vila Sônia',
    whatsappPhone: '(11) 91890-1234',
    referralSource: 'Redes Sociais (Instagram)',
    age: 7,
    registeredAt: '2026-09-20 16:45',
  },
  {
    id: 'reg-009',
    sequenceNumber: 9,
    credentialCode: 'MPGA26-009',
    guardianName: 'Marcelo Castro',
    childName: 'Gabriel Henrique Castro',
    birthDate: '2016-03-14',
    cityNeighborhood: 'São Paulo - Butantã',
    whatsappPhone: '(11) 91999-2345',
    referralSource: 'Escola ou Creche',
    age: 10,
    registeredAt: '2026-09-20 17:05',
  },
  {
    id: 'reg-010',
    sequenceNumber: 10,
    credentialCode: 'MPGA26-010',
    guardianName: 'Patrícia Nogueira',
    childName: 'Sophia Vitória Nogueira',
    birthDate: '2021-07-22',
    cityNeighborhood: 'Osasco - Bela Vista',
    whatsappPhone: '(11) 92345-6789',
    referralSource: 'Grupos de WhatsApp',
    age: 5,
    registeredAt: '2026-09-20 17:30',
  },
  {
    id: 'reg-011',
    sequenceNumber: 11,
    credentialCode: 'MPGA26-011',
    guardianName: 'Thiago Mendes',
    childName: 'Heitor Leonardo Mendes',
    birthDate: '2018-11-05',
    cityNeighborhood: 'São Paulo - Pinheiros',
    whatsappPhone: '(11) 93456-7890',
    referralSource: 'Amigos ou Familiares',
    age: 8,
    registeredAt: '2026-09-20 17:50',
  },
  {
    id: 'reg-012',
    sequenceNumber: 12,
    credentialCode: 'MPGA26-012',
    guardianName: 'Luciana Martins',
    childName: 'Laura Beatriz Martins',
    birthDate: '2017-09-18',
    cityNeighborhood: 'São Paulo - Rio Pequeno',
    whatsappPhone: '(11) 94567-1234',
    referralSource: 'Igreja ou Comunidade Local',
    age: 9,
    registeredAt: '2026-09-20 18:15',
  },
  {
    id: 'reg-013',
    sequenceNumber: 13,
    credentialCode: 'MPGA26-013',
    guardianName: 'Roberto Silveira',
    childName: 'Samuel Lucca Silveira',
    birthDate: '2019-02-28',
    cityNeighborhood: 'São Paulo - Jaguaré',
    whatsappPhone: '(11) 95678-2345',
    referralSource: 'Cartaz / Faixa no Bairro',
    age: 7,
    registeredAt: '2026-09-20 18:40',
  },
  {
    id: 'reg-014',
    sequenceNumber: 14,
    credentialCode: 'MPGA26-014',
    guardianName: 'Renata Albuquerque',
    childName: 'Isabella Maria Albuquerque',
    birthDate: '2022-05-19',
    cityNeighborhood: 'Cotia - Granja Viana',
    whatsappPhone: '(11) 96789-3456',
    referralSource: 'Redes Sociais (Instagram)',
    age: 4,
    registeredAt: '2026-09-20 19:00',
  },
  {
    id: 'reg-015',
    sequenceNumber: 15,
    credentialCode: 'MPGA26-015',
    guardianName: 'Carlos Eduardo Souza',
    childName: 'Davi Lucca Souza',
    birthDate: '2018-01-10',
    cityNeighborhood: 'Taboão da Serra - Pirajuçara',
    whatsappPhone: '(11) 97890-4567',
    referralSource: 'Amigos ou Familiares',
    age: 8,
    registeredAt: '2026-09-20 19:25',
  },
  {
    id: 'reg-016',
    sequenceNumber: 16,
    credentialCode: 'MPGA26-016',
    guardianName: 'Vanessa Prado',
    childName: 'Manuela Cristina Prado',
    birthDate: '2015-10-03',
    cityNeighborhood: 'São Paulo - Lapa',
    whatsappPhone: '(11) 98901-5678',
    referralSource: 'Já participei em edições anteriores',
    age: 11,
    registeredAt: '2026-09-20 19:50',
  },
  {
    id: 'reg-017',
    sequenceNumber: 17,
    credentialCode: 'MPGA26-017',
    guardianName: 'Fábio Gomes',
    childName: 'Matheus Felipe Gomes',
    birthDate: '2017-06-27',
    cityNeighborhood: 'São Paulo - Morumbi',
    whatsappPhone: '(11) 99012-6789',
    referralSource: 'Grupos de WhatsApp',
    age: 9,
    registeredAt: '2026-09-20 20:10',
  },
  {
    id: 'reg-018',
    sequenceNumber: 18,
    credentialCode: 'MPGA26-018',
    guardianName: 'Aline Barbosa',
    childName: 'Lorena Gabriela Barbosa',
    birthDate: '2020-12-14',
    cityNeighborhood: 'São Paulo - Vila Leopoldina',
    whatsappPhone: '(11) 91234-7890',
    referralSource: 'Escola ou Creche',
    age: 6,
    registeredAt: '2026-09-20 20:30',
  },
  {
    id: 'reg-019',
    sequenceNumber: 19,
    credentialCode: 'MPGA26-019',
    guardianName: 'Guilherme Toledo',
    childName: 'Joaquim Vicente Toledo',
    birthDate: '2021-03-31',
    cityNeighborhood: 'Osasco - Centro',
    whatsappPhone: '(11) 92345-8901',
    referralSource: 'Igreja ou Comunidade Local',
    age: 5,
    registeredAt: '2026-09-20 20:55',
  },
  {
    id: 'reg-020',
    sequenceNumber: 20,
    credentialCode: 'MPGA26-020',
    guardianName: 'Camila Pires',
    childName: 'Yasmin Vitória Pires',
    birthDate: '2016-08-09',
    cityNeighborhood: 'São Paulo - Perdizes',
    whatsappPhone: '(11) 93456-9012',
    referralSource: 'Redes Sociais (Facebook)',
    age: 10,
    registeredAt: '2026-09-20 21:15',
  },
  {
    id: 'reg-021',
    sequenceNumber: 21,
    credentialCode: 'MPGA26-021',
    guardianName: 'Diego Antunes',
    childName: 'Benjamin Caleb Antunes',
    birthDate: '2019-07-04',
    cityNeighborhood: 'São Paulo - Vila Madalena',
    whatsappPhone: '(11) 94567-0123',
    referralSource: 'Amigos ou Familiares',
    age: 7,
    registeredAt: '2026-09-20 21:40',
  },
  {
    id: 'reg-022',
    sequenceNumber: 22,
    credentialCode: 'MPGA26-022',
    guardianName: 'Juliana Vasconcelos',
    childName: 'Cecília Clara Vasconcelos',
    birthDate: '2018-04-20',
    cityNeighborhood: 'São Paulo - Vila Sônia',
    whatsappPhone: '(11) 95678-1234',
    referralSource: 'Cartaz / Faixa no Bairro',
    age: 8,
    registeredAt: '2026-09-20 22:00',
  },
  {
    id: 'reg-023',
    sequenceNumber: 23,
    credentialCode: 'MPGA26-023',
    guardianName: 'Leandro Cardoso',
    childName: 'Murilo Henrique Cardoso',
    birthDate: '2020-01-16',
    cityNeighborhood: 'Barueri - Alphaville',
    whatsappPhone: '(11) 96789-2345',
    referralSource: 'Grupos de WhatsApp',
    age: 6,
    registeredAt: '2026-09-20 22:20',
  },
  {
    id: 'reg-024',
    sequenceNumber: 24,
    credentialCode: 'MPGA26-024',
    guardianName: 'Cristiane Meireles',
    childName: 'Agatha Valentina Meireles',
    birthDate: '2022-09-02',
    cityNeighborhood: 'São Paulo - Butantã',
    whatsappPhone: '(11) 97890-3456',
    referralSource: 'Escola ou Creche',
    age: 4,
    registeredAt: '2026-09-20 22:45',
  },
  {
    id: 'reg-025',
    sequenceNumber: 25,
    credentialCode: 'MPGA26-025',
    guardianName: 'Vinícius Machado',
    childName: 'Nicolas Gabriel Machado',
    birthDate: '2017-12-11',
    cityNeighborhood: 'Taboão da Serra - Parque Pinheiros',
    whatsappPhone: '(11) 98901-4567',
    referralSource: 'Amigos ou Familiares',
    age: 9,
    registeredAt: '2026-09-20 23:10',
  }
];

export const APP_CONFIG = {
  name: 'Meu Pequeno Grande Amigo',
  tagline: 'Campanha de doação de brinquedos — 12 de outubro',
  dateBadge: '12 DE OUTUBRO',
  mainDeliveryDate: '12 de outubro, 9h às 17h',
  location: 'Centro Comunitário, Rua das Acácias, 120',
  email: 'michaelorocha1@gmail.com',
  whatsapp: '+55 (11) 954522974',
  whatsappRaw: '5511954522974',
  pixKey: 'michaelorocha1@gmail.com',
  pixKeyType: 'Chave E-mail',
  pixQrCodeUrl: '/pix-qrcode.png',
  pixPayload: '00020126460014BR.GOV.BCB.PIX0124michaelorocha1@gmail.com5204000053039865802BR5924MEU PEQUENO GRANDE AMIGO6009SAO PAULO62070503***6304FAC8',
  logoUrl: '/logo.svg',
  heroMainImage: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1200&q=80'
};

export const HERO_SLIDES = [
  {
    url: APP_CONFIG.heroMainImage,
    title: 'Mural de Brinquedos e Pelúcias',
    subtitle: 'Mais de 1.200 brinquedos já arrecadados para o Dia das Crianças'
  },
  {
    url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80',
    title: 'Brinquedos Educativos e Jogos',
    subtitle: 'Cada brinquedo é inspecionado, higienizado e embalado com muito amor'
  },
  {
    url: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=1200&q=80',
    title: 'Voluntários em Ação',
    subtitle: 'Nossa rede de voluntários unida para transformar o Dia das Crianças'
  },
  {
    url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80',
    title: 'Sorrisos e Celebração',
    subtitle: 'A emoção de fazer uma criança se sentir acolhida, especial e amada'
  }
];

export const INITIAL_CHILDREN: Child[] = [
  {
    id: 'c-1',
    childName: 'Lucas Gabriel',
    age: 6,
    gender: 'Menino',
    guardianName: 'Mariana S. Silva',
    guardianPhone: '(11) 98765-4321',
    neighborhood: 'Jardim Primavera',
    toyPreference: 'Carrinhos / Pistas',
    wishDetails: 'Adora brincar de corrida e sonha em ter um caminhão de bombeiro ou carrinho de controle remoto.',
    status: 'aguardando',
    protocolNumber: 'MPGA-2024-001',
    createdAt: '2024-09-01'
  },
  {
    id: 'c-2',
    childName: 'Sophia Emanuelly',
    age: 4,
    gender: 'Menina',
    guardianName: 'Juliana P. Castro',
    guardianPhone: '(11) 97654-3210',
    neighborhood: 'Vila Esperança',
    toyPreference: 'Bonecas / Acessórios',
    wishDetails: 'Gosta muito de cuidar de bonecas bebês e bichinhos de pelúcia com mamadeira.',
    status: 'aguardando',
    protocolNumber: 'MPGA-2024-002',
    createdAt: '2024-09-02'
  },
  {
    id: 'c-3',
    childName: 'Enzo Miguel',
    age: 8,
    gender: 'Menino',
    guardianName: 'Carlos Eduardo Santos',
    guardianPhone: '(11) 96543-2109',
    neighborhood: 'Parque das Flores',
    toyPreference: 'Jogos de Tabuleiro / Lego',
    wishDetails: 'Muito curioso e esperto, gosta de blocos de montar, dinossauros e quebra-cabeças.',
    status: 'aguardando',
    protocolNumber: 'MPGA-2024-003',
    createdAt: '2024-09-03'
  },
  {
    id: 'c-4',
    childName: 'Valentina Vitória',
    age: 5,
    gender: 'Menina',
    guardianName: 'Fernanda R. Lima',
    guardianPhone: '(11) 95432-1098',
    neighborhood: 'Jardim das Acácias',
    toyPreference: 'Bichos de Pelúcia / Desenho',
    wishDetails: 'Sonha com uma pelúcia de ursinho fofinho e kit com lápis de cor e livrinho de colorir.',
    status: 'apadrinhado',
    protocolNumber: 'MPGA-2024-004',
    createdAt: '2024-09-04',
    sponsorName: 'Família Albuquerque'
  },
  {
    id: 'c-5',
    childName: 'Davi Lucca',
    age: 7,
    gender: 'Menino',
    guardianName: 'Aline M. Barbosa',
    guardianPhone: '(11) 94321-0987',
    neighborhood: 'Bairro Santa Luzia',
    toyPreference: 'Bola de Futebol / Esportes',
    wishDetails: 'Adora futebol e sonha com uma bola nova ou jogo de esportes para jogar com os primos.',
    status: 'aguardando',
    protocolNumber: 'MPGA-2024-005',
    createdAt: '2024-09-05'
  },
  {
    id: 'c-6',
    childName: 'Isabella Cristina',
    age: 3,
    gender: 'Menina',
    guardianName: 'Renata O. Souza',
    guardianPhone: '(11) 93210-9876',
    neighborhood: 'Vila Nova',
    toyPreference: 'Brinquedos Musicais / Formas',
    wishDetails: 'Pequena e alegre, gosta de brinquedos com sons e encaixes de formas coloridas.',
    status: 'apadrinhado',
    protocolNumber: 'MPGA-2024-006',
    createdAt: '2024-09-06',
    sponsorName: 'Dra. Beatriz Mendes'
  }
];

export const DROP_POINTS: DropPoint[] = [
  {
    id: 'dp-1',
    name: 'Ponto Central - Centro Comunitário',
    address: 'Rua das Acácias, 120 - Jardim das Acácias',
    neighborhood: 'Centro / Jardim das Acácias',
    hours: 'Segunda a Sábado, das 08h às 18h',
    contactPhone: '(11) 95452-2974',
    responsiblePerson: 'Coordenação Meu Pequeno Grande Amigo',
    mapsQuery: 'Rua das Acácias, 120'
  },
  {
    id: 'dp-2',
    name: 'Igreja Santa Rita de Cássia',
    address: 'Av. Paulista das Flores, 450 - Parque das Flores',
    neighborhood: 'Parque das Flores',
    hours: 'Terça a Domingo, das 09h às 17h',
    contactPhone: '(11) 98822-1133',
    responsiblePerson: 'Pastoral Comunitária',
    mapsQuery: 'Av. Paulista das Flores, 450'
  },
  {
    id: 'dp-3',
    name: 'Escola Aquarela Kids & Coworking',
    address: 'Rua dos Girassóis, 89 - Vila Esperança',
    neighborhood: 'Vila Esperança',
    hours: 'Segunda a Sexta, das 07h30 às 19h',
    contactPhone: '(11) 97711-4455',
    responsiblePerson: 'Profa. Cláudia e Equipe',
    mapsQuery: 'Rua dos Girassóis, 89'
  },
  {
    id: 'dp-4',
    name: 'Studio & Academia Corpo em Movimento',
    address: 'Rua Almirante Barroso, 310 - Jardim Primavera',
    neighborhood: 'Jardim Primavera',
    hours: 'Segunda a Sexta, das 06h às 21h | Sáb 08h às 14h',
    contactPhone: '(11) 99933-7788',
    responsiblePerson: 'Marcelo e Amanda',
    mapsQuery: 'Rua Almirante Barroso, 310'
  }
];

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    year: '2014',
    title: 'O Primeiro Passo',
    description: 'Um grupo de 5 amigos se reuniu para arrecadar 50 brinquedos para crianças de uma creche comunitária local.',
    stat: '50+',
    statLabel: 'Crianças presenteadas'
  },
  {
    year: '2017',
    title: 'Expansão Comunitária',
    description: 'Criação dos primeiros pontos de coleta nos comércios parceiros e envolvimento de mais de 30 voluntários dedicados.',
    stat: '350+',
    statLabel: 'Brinquedos arrecadados'
  },
  {
    year: '2020',
    title: 'Solidariedade em Tempos Difíceis',
    description: 'Adaptação dos kits com álcool em gel, higienização rigorosa e entregas porta a porta em bairros vulneráveis.',
    stat: '800+',
    statLabel: 'Famílias acolhidas'
  },
  {
    year: '2023',
    title: 'Uma Década de Amor',
    description: 'Comemoração de 10 anos com grande festa comunitária, pintura facial, pipoca, teatro e entrega de presentes para 4 bairros.',
    stat: '1.450+',
    statLabel: 'Presentes entregues'
  },
  {
    year: '2024',
    title: 'Campanha Atual: 2.000 Sorrisos',
    description: 'Meta ampliada para alcançar 2.000 crianças cadastradas em 8 bairros da cidade no dia 12 de outubro.',
    stat: '2.000',
    statLabel: 'Meta deste ano'
  }
];

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'g-1',
    url: APP_CONFIG.heroMainImage,
    title: 'Mural de Pelúcias Arrecadadas',
    category: 'brinquedos',
    year: '2024'
  },
  {
    id: 'g-2',
    url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=800&q=80',
    title: 'Festa de Entrega do Dia das Crianças',
    category: 'entregas',
    year: '2023'
  },
  {
    id: 'g-3',
    url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    title: 'Equipe de Voluntários na Triagem',
    category: 'voluntarios',
    year: '2023'
  },
  {
    id: 'g-4',
    url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80',
    title: 'Brincadeiras e Recreação',
    category: 'sorrisos',
    year: '2023'
  },
  {
    id: 'g-5',
    url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=800&q=80',
    title: 'Higienização e Embalagem dos Brinquedos',
    category: 'brinquedos',
    year: '2024'
  },
  {
    id: 'g-6',
    url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
    title: 'Distribuição nos Bairros Cadastrados',
    category: 'entregas',
    year: '2023'
  }
];

export const FAQS = [
  {
    q: 'Quais tipos de brinquedos posso doar?',
    a: 'Aceitamos brinquedos novos ou seminovos em perfeito estado de conservação (com todas as peças e sem partes quebradas). Bichos de pelúcia, bonecas, carrinhos, bolas, jogos de tabuleiro e brinquedos educativos são muito bem-vindos!'
  },
  {
    q: 'Como funciona a higienização dos brinquedos seminovos?',
    a: 'Nossa equipe de voluntários realiza um processo completo de limpeza, desinfecção com produtos atóxicos e teste de peças. Em seguida, cada brinquedo é colocado em uma embalagem transparente festiva com laço.'
  },
  {
    q: 'Quem pode cadastrar uma criança?',
    a: 'Pais, mães, responsáveis legais ou líderes comunitários dos bairros atendidos. Cada criança cadastrada recebe um número de protocolo para acompanhamento.'
  },
  {
    q: 'Como posso me cadastrar como doador do projeto?',
    a: 'Basta acessar a página "Seja Doador" no menu superior, preencher seu nome e telefone para que nossa equipe entre em contato, ou realizar uma doação direta via PIX nos valores de R$ 10, R$ 30 ou R$ 100.'
  },
  {
    q: 'Até quando posso realizar as doações?',
    a: 'As doações podem ser feitas até o dia 08 de outubro, garantindo tempo hábil para aquisição, embalagem e organização dos presentes antes da grande comemoração do dia 12 de outubro.'
  }
];
