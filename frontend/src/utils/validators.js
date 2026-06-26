// Validadores — equivalentes ao lib/validators.php original

export function validarCPF(cpf) {
  const raw = cpf.replace(/\D/g, '');
  if (raw.length !== 11 || /^(\d)\1+$/.test(raw)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(raw[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(raw[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(raw[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(raw[10]);
}

export function validarPlaca(placa) {
  const raw = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  // Padrão antigo: AAA9999
  const antigo = /^[A-Z]{3}[0-9]{4}$/;
  // Padrão Mercosul: AAA9A99
  const mercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  return antigo.test(raw) || mercosul.test(raw);
}

export function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validarTelefone(tel) {
  const raw = tel.replace(/\D/g, '');
  return raw.length >= 10 && raw.length <= 11;
}

// RF12: validação simulada da CNH — 11 dígitos numéricos, não todos iguais
export function validarCNH(cnh) {
  const raw = (cnh || '').replace(/\D/g, '');
  return raw.length === 11 && !/^(\d)\1+$/.test(raw);
}

export function formatarCNH(cnh) {
  return (cnh || '').replace(/\D/g, '').substring(0, 11);
}

// RF06: rótulos e cores dos status do veículo
export const STATUS_VEICULO = {
  disponivel: { label: 'Disponível', variant: 'success' },
  locado: { label: 'Locado', variant: 'danger' },
  aguardando_limpeza: { label: 'Aguardando Limpeza', variant: 'warning' },
  manutencao: { label: 'Em Manutenção', variant: 'purple' },
};

// Converte 'YYYY-MM-DD' para Date no fuso local (new Date('YYYY-MM-DD') seria UTC,
// o que faz a data de hoje parecer "ontem" em fusos negativos como o do Brasil)
export function parseDataLocal(str) {
  const [y, m, d] = str.split('T')[0].split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Data de hoje no formato YYYY-MM-DD no fuso local (toISOString() seria UTC)
export function hojeISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function validarDatas(dataRetirada, dataEntrega) {
  const r = parseDataLocal(dataRetirada);
  const e = parseDataLocal(dataEntrega);
  const hoje = parseDataLocal(hojeISO());
  if (r < hoje) return 'Data de retirada não pode ser no passado.';
  if (e <= r) return 'Data de entrega deve ser posterior à data de retirada.';
  return null;
}

export function formatarCPF(cpf) {
  return cpf
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatarTelefone(tel) {
  return tel
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
}

export function formatarPlaca(placa) {
  return placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 7);
}

export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export function formatarData(data) {
  if (!data) return '—';
  const [y, m, d] = data.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
}

export function diffDias(dataA, dataB) {
  const a = parseDataLocal(dataA);
  const b = parseDataLocal(dataB);
  return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}
