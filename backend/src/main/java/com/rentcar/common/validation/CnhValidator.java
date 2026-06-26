package com.rentcar.common.validation;

/**
 * Validacao simulada da CNH (trabalho academico): a CNH real possui 11 digitos
 * numericos. Aqui validamos o formato (11 digitos, nao todos iguais) — proximo
 * do real, sem replicar o algoritmo oficial de digito verificador. A validade
 * (data de vencimento) e checada separadamente no momento da reserva.
 */
public final class CnhValidator {

    private CnhValidator() {}

    public static boolean formatoValido(String numeroCnh) {
        if (numeroCnh == null) return false;
        String digitos = numeroCnh.replaceAll("\\D", "");
        if (digitos.length() != 11) return false;
        // rejeita sequencias triviais como 00000000000
        return digitos.chars().distinct().count() > 1;
    }
}
