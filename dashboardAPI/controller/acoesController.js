
import { getAcoes, getAcao, postAcoes, deleteAcao, putAcao } from '../model/modelAcao.js';
import { verificaIdPonto } from '../regrasNegocios/regrasNegociosAcoes.js';

function camposAcaoValidos({ pontoId, data, leads, vendas, degustacao_tele }) {
    const numeroValido = (valor) =>
        (typeof valor === 'string' || typeof valor === 'number') &&
        valor !== '' && valor !== null && valor !== undefined &&
        !(typeof valor === 'string' && valor.trim().length === 0) &&
        Number.isFinite(Number(valor)) && Number(valor) >= 0;

    return typeof pontoId === 'string' && pontoId.trim().length > 0 &&
        typeof data === 'string' && data.trim().length > 0 &&
        Number.isFinite(Date.parse(data)) &&
        numeroValido(leads) && numeroValido(vendas) && numeroValido(degustacao_tele);
}

export async function buscarAcoes(req, res) {
    try {
        const acoes = await getAcoes(req.empresaId);
        res.status(200).json(acoes);
    } catch(error){
        console.error("Erro ao obter ações:", error);
        res.status(500).json({ error: "Erro ao obter ações" });
    }
}

export async function criarAcoes(req, res) {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: "Todos os campos são obrigatórios" });
        }
        const { pontoId, data, leads, vendas, degustacao_tele } = req.body;
        if (!camposAcaoValidos({ pontoId, data, leads, vendas, degustacao_tele })) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios" });
        }

        // Validar se pontoId existe
        const pontoExiste = await verificaIdPonto(pontoId, req.empresaId);
        if (!pontoExiste) {
            return res.status(404).json({ error: "Ponto com esse ID não existe" });
        }

        const novaAcao = await postAcoes({
            pontoId,
            data,
            leads,
            vendas,
            degustacao_tele,
            empresaId: req.empresaId,
            usuarioId: req.usuario.id
        });
        res.status(201).json(novaAcao);
    } catch(error){
        console.error("Erro ao criar ação:", error);
        res.status(500).json({ error: "Erro ao criar ação" });
    }
}

export async function removerAcao(req, res) {
    try {
        const { id } = req.params;
        const acao = await getAcao(id, req.empresaId);
        if (!acao) {
            return res.status(404).json({ error: "Ação com esse ID não encontrada" });
        }
        if (req.usuario.papel === 'colaborador' && String(acao.usuarioId || '') !== req.usuario.id) {
            return res.status(403).json({ error: "Você só pode excluir ações registradas por você" });
        }

        const acaoRemovida = await deleteAcao(id, req.empresaId);
        if (!acaoRemovida) {
            return res.status(404).json({ error: "Ação com esse ID não encontrada" });
        }
        res.status(200).json({ message: "Ação removida com sucesso" });
    } catch (error) {
        console.error("Erro ao remover ação:", error);
        res.status(500).json({ error: "Erro ao remover ação" });
    }
}

export async function atualizarAcao(req, res) {
    try {
        const { id } = req.params;
        const acao = await getAcao(id, req.empresaId);
        if (!acao) {
            return res.status(404).json({ error: "Ação com esse ID não encontrada" });
        }
        if (req.usuario.papel === 'colaborador' && String(acao.usuarioId || '') !== req.usuario.id) {
            return res.status(403).json({ error: "Você só pode editar ações registradas por você" });
        }

        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: "Todos os campos são obrigatórios e devem ser válidos" });
        }
        const { pontoId, data, leads, vendas, degustacao_tele } = req.body;
        if (!camposAcaoValidos({ pontoId, data, leads, vendas, degustacao_tele })) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios e devem ser válidos" });
        }
        const pontoExiste = await verificaIdPonto(pontoId, req.empresaId);
        if (!pontoExiste) {
            return res.status(404).json({ error: "Ponto com esse ID não existe" });
        }

        const acaoAtualizada = await putAcao(id, req.empresaId, { pontoId, data, leads, vendas, degustacao_tele });

        if (!acaoAtualizada) {
            return res.status(404).json({ error: "Ação com esse ID não encontrada" });
        }
        res.status(200).json(acaoAtualizada);
    } catch (error) {
        console.error("Erro ao atualizar ação:", error);
        res.status(500).json({ error: "Erro ao atualizar ação" });
    }
}