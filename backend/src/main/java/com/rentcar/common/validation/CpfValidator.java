package com.rentcar.common.validation;

public final class CpfValidator {

    private CpfValidator() {}

    public static boolean isValido(String cpf) {
        if (cpf == null) return false;
        String digitos = cpf.replaceAll("\\D", "");
        if (digitos.length() != 11) return false;
        if (digitos.chars().distinct().count() == 1) return false;

        int d1 = calcularDigito(digitos, 9, 10);
        int d2 = calcularDigito(digitos, 10, 11);

        return d1 == Character.getNumericValue(digitos.charAt(9))
                && d2 == Character.getNumericValue(digitos.charAt(10));
    }

    private static int calcularDigito(String digitos, int tamanho, int pesoInicial) {
        int soma = 0;
        for (int i = 0; i < tamanho; i++) {
            soma += Character.getNumericValue(digitos.charAt(i)) * (pesoInicial - i);
        }
        int resto = (soma * 10) % 11;
        return (resto == 10 || resto == 11) ? 0 : resto;
    }
}
