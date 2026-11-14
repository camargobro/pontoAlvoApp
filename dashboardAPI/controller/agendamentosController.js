import mongoose from "mongoose";
import { getAgendamentos, getAgendamentoById, postAgendamento, putAgendamento, deleteAgendamento } from "../model/modelAgendamentos.js";
import { getPontoById } from "../model/modelPonto.js";
import { validarAgendamento } from "../regrasNegocios/regraNegociosAgendamentos.js";

function erroDeValidacao(error) {
    return error?.name === "ValidationError" || error?.name === "CastError";
}

async function pontoPertenceEmpresa(pontoId, empresaId) {
    if (!mongoose.isValidObjectId(pontoId)) {
        return false;
    }

    return Boolean(await getPontoById(pontoId, empresaId));
}

export async function listarAgendamentos(req, res) {
    try {
        const agendamentos = await getAgendamentos(req.empresaId);
        res.status(200).json(agendamentos);
    } catch (error) {
        console.error("Erro ao listar agendamentos:", error);
        res.status(500).json({ error: "Erro ao listar agendamentos" });
    }
}   

export async function listarAgendamentoPorId(req, res) {
    try {
        const agendamento = await getAgendamentoById(req.params.id, req.empresaId);
        if (!agendamento) {
            return res.status(404).json({ error: "Agendamento não encontrado" });
        }
        res.status(200).json(agendamento);
    } catch (error) {
        console.error("Erro ao buscar agendamento:", error);
        res.status(500).json({ error: "Erro ao buscar agendamento" });
    }
}

export async function criarAgendamento(req, res) {
    try {
        const agendamentoValido = await validarAgendamento(req.body);
        if (!agendamentoValido) {
            return res.status(400).json({ error: "Dados do agendamento inválidos" });
        }
        if (!(await pontoPertenceEmpresa(req.body.pontoId, req.empresaId))) {
            return res.status(404).json({ error: "Ponto não encontrado" });
        }
        const novoAgendamento = await postAgendamento({ ...req.body, empresaId: req.empresaId });
        res.status(201).json(novoAgendamento);
    } catch (error) {
        console.error("Erro ao criar agendamento:", error);
        if (erroDeValidacao(error)) {
            return res.status(400).json({ error: "Dados do agendamento inválidos" });
        }
        res.status(500).json({ error: "Erro ao criar agendamento" });
    }
}

export async function atualizarAgendamento(req, res) {
    try {
        const agendamentoValido = await validarAgendamento(req.body);
        if (!agendamentoValido) {
            return res.status(400).json({ error: "Dados do agendamento inválidos" });
        }
        if (!(await pontoPertenceEmpresa(req.body.pontoId, req.empresaId))) {
            return res.status(404).json({ error: "Ponto não encontrado" });
        }
        const agendamentoAtualizado = await putAgendamento(req.params.id, req.empresaId, req.body);
        if (!agendamentoAtualizado) {
            return res.status(404).json({ error: "Agendamento não encontrado" });
        }
        res.status(200).json(agendamentoAtualizado);
    } catch (error) {
        console.error("Erro ao atualizar agendamento:", error);
        if (erroDeValidacao(error)) {
            return res.status(400).json({ error: "Dados do agendamento inválidos" });
        }
        res.status(500).json({ error: "Erro ao atualizar agendamento" });
    }
}
export async function deletarAgendamento(req, res) {
    try {
        const agendamentoDeletado = await deleteAgendamento(req.params.id, req.empresaId);
        if (!agendamentoDeletado) {
            return res.status(404).json({ error: "Agendamento não encontrado" });
        }
        res.status(200).json({ message: "Agendamento deletado com sucesso" });
    } catch (error) {
        console.error("Erro ao deletar agendamento:", error);
        res.status(500).json({ error: "Erro ao deletar agendamento" });
    }
}