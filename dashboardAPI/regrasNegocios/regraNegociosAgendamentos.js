
export async function validarAgendamento(agendamento) {
    if (!agendamento || typeof agendamento !== 'object' || Array.isArray(agendamento)) {
        return false;
    }

    const { calendario, data, hora, pontoId, responsavel, contato } = agendamento;
    const calendarioNumero = typeof calendario === 'number' || typeof calendario === 'string'
        ? Number(calendario)
        : NaN;
    const textosValidos = [hora, pontoId, responsavel, contato]
        .every(valor => typeof valor === 'string' && valor.trim().length > 0);

    return textosValidos
        && Number.isInteger(calendarioNumero)
        && [1, 2, 3].includes(calendarioNumero)
        && typeof data === 'string'
        && data.trim().length > 0
        && Number.isFinite(Date.parse(data));
}