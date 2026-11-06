
import { getPontos, postPonto, deletePonto, putPonto } from '../model/modelPonto.js';
import { pontoDuplicado } from '../regrasNegocios/regrasNegociosPontos.js';

function camposPontoValidos({ nome, telefone, endereco, bairro, cidade, tipo }) {
    return [nome, telefone, endereco, bairro, cidade, tipo]
        .every((valor) => typeof valor === 'string' && valor.trim().length > 0);
}

export async function buscarPontos(req, res) {
    try {
        const pontos = await getPontos(req.empresaId);
        res.status(200).json(pontos);
    } catch (error) {
        console.error("Erro ao obter pontos:", error);
        res.status(500).json({ error: "Erro ao obter pontos" });
    }
}

export async function criarPontos(req, res) {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: "Todos os campos são obrigatórios" });
        }
        const { nome, telefone, endereco, bairro, cidade, tipo } = req.body;

        if (!camposPontoValidos({ nome, telefone, endereco, bairro, cidade, tipo })) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios" });
        }

        // Validar se ponto já existe
        const duplicado = await pontoDuplicado({ nome, endereco }, req.empresaId);
        if (duplicado) {
            return res.status(409).json({ error: "Ponto com esse nome e endereço já existe" });
        }

        const novoPonto = await postPonto({ nome, telefone, endereco, bairro, cidade, tipo, empresaId: req.empresaId });

        if (!novoPonto) {
            return res.status(400).json({ error: "Erro ao criar ponto" });
        }

        return res.status(201).json(novoPonto);
    } catch (error) {
        console.error("Erro ao criar ponto:", error);
        return res.status(500).json({ error: "Erro ao criar ponto" });
    }
}

export async function removerPonto(req, res) {
    try {
        const pontoRemovido = await deletePonto(req.params.id, req.empresaId);
        if (!pontoRemovido) {
            return res.status(404).json({ error: "Ponto com esse ID não encontrado" });
        }
        return res.status(200).json({ message: "Ponto removido com sucesso" });
    } catch (error) {
        console.error("Erro ao remover ponto:", error);
        return res.status(500).json({ error: "Erro ao remover ponto" });
    }
}

export async function atualizarPonto(req, res) {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: "Todos os campos são obrigatórios" });
        }
        const { nome, telefone, endereco, bairro, cidade, tipo } = req.body;
        if (!camposPontoValidos({ nome, telefone, endereco, bairro, cidade, tipo })) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios" });
        }

        const duplicado = await pontoDuplicado({ nome, endereco }, req.empresaId, req.params.id);
        if (duplicado) {
            return res.status(409).json({ error: "Ponto com esse nome e endereço já existe" });
        }

        const pontoAtualizado = await putPonto(req.params.id, req.empresaId, { nome, telefone, endereco, bairro, cidade, tipo });

        if (!pontoAtualizado) {
            return res.status(404).json({ error: "Ponto com esse ID não encontrado" });
        }

        return res.status(200).json(pontoAtualizado);
    } catch (error) {
        console.error("Erro ao atualizar ponto:", error);
        return res.status(500).json({ error: "Erro ao atualizar ponto" });
    }
}
