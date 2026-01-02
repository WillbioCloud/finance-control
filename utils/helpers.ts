// Função para gerar UUIDs compatíveis com o Supabase (PostgreSQL)
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Função para comparar textos ignorando acentos e caixa alta/baixa
export const normalizeText = (text: string) => {
  if (!text) return ''; // Proteção contra textos nulos/indefinidos
  
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .trim()
    .toLowerCase();
};