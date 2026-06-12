package com.rentcar.features.aluguel;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AluguelRepository extends JpaRepository<Aluguel, Long> {
    List<Aluguel> findByUsuarioId(Long usuarioId);
    List<Aluguel> findByVeiculoIdAndStatus(Long veiculoId, StatusAluguel status);
    long countByStatus(StatusAluguel status);

    @Query("SELECT COUNT(a) > 0 FROM Aluguel a WHERE a.veiculo.id = :veiculoId AND a.status = :status " +
           "AND a.dataRetirada <= :fimJanela AND a.dataEntrega >= :inicioJanela")
    boolean existsConflito(@Param("veiculoId") Long veiculoId, @Param("status") StatusAluguel status,
                           @Param("inicioJanela") LocalDate inicioJanela, @Param("fimJanela") LocalDate fimJanela);

    // Veiculos com aluguel ativo cruzando a janela [inicioJanela, fimJanela].
    // Para a janela de um periodo desejado [retirada, entrega], chamar com
    // [retirada - 1, entrega + 1] para aplicar o buffer de 1 dia entre alugueis.
    @Query("SELECT DISTINCT a.veiculo.id FROM Aluguel a WHERE a.status = :status " +
           "AND a.dataRetirada <= :fimJanela AND a.dataEntrega >= :inicioJanela")
    List<Long> findVeiculoIdsOcupados(@Param("status") StatusAluguel status,
                                       @Param("inicioJanela") LocalDate inicioJanela,
                                       @Param("fimJanela") LocalDate fimJanela);
}
