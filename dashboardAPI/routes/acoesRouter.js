import express from 'express';
import { buscarAcoes, criarAcoes, removerAcao, atualizarAcao } from '../controller/acoesController.js';
import { autenticar } from '../middlewares/autenticacaoUsuario.js';
import { exigirEmpresa, exigirPapel } from '../middlewares/exigirPapel.js';
const router = express.Router();

router.use(autenticar, exigirPapel('gestor', 'colaborador'), exigirEmpresa);

router.get('/', buscarAcoes);
router.post('/', criarAcoes);
router.delete('/:id', removerAcao);
router.put('/:id', atualizarAcao);
export default router;
