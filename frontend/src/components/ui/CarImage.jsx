import { useState } from 'react';
import { Car } from 'lucide-react';

/**
 * Mostra a foto real do veículo (campo `imagem`). Se não houver URL ou a imagem
 * falhar ao carregar, exibe um ícone de carro como fallback.
 */
export default function CarImage({ veiculo, className = '', iconSize = 36, rounded = '' }) {
  const [erro, setErro] = useState(false);
  const url = veiculo?.imagem;

  if (!url || erro) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-indigo-600/20 to-purple-600/20 ${rounded} ${className}`}>
        <Car size={iconSize} className="text-indigo-400" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={`${veiculo?.fabricante ?? ''} ${veiculo?.modelo ?? ''}`.trim() || 'Veículo'}
      loading="lazy"
      onError={() => setErro(true)}
      className={`object-cover ${rounded} ${className}`}
    />
  );
}
