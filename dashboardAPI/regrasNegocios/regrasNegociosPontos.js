
import { Pontos } from '../model/modelPonto.js';

export async function pontoDuplicado(ponto, empresaId, excluirId = null) {
    try {
        const duplicado = await Pontos.findOne({
            nome: ponto.nome,
            endereco: ponto.endereco,
            empresaId,
            ...(excluirId ? { _id: { $ne: excluirId } } : {})
        });
        return duplicado !== null;
    } catch (error) {
        console.error('Erro ao verificar ponto duplicado:', error);
        return false;
    }
}