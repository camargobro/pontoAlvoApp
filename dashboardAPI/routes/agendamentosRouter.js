import express from "express";
import { autenticar } from "../middlewares/autenticacaoUsuario.js";
import { exigirEmpresa, exigirPapel } from '../middlewares/exigirPapel.js';
import { listarAgendamentos, listarAgendamentoPorId, criarAgendamento, deletarAgendamento, atualizarAgendamento } from "../controller/agendamentosController.js";

const router = express.Router();

router.use(autenticar, exigirPapel('gestor', 'colaborador'), exigirEmpresa);

router.get('/', listarAgendamentos);
router.get('/:id', listarAgendamentoPorId);
router.post('/', criarAgendamento);
router.delete('/:id', deletarAgendamento);
router.put('/:id', atualizarAgendamento);

export default router;