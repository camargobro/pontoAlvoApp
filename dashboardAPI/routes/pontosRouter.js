import express from 'express';
import { criarPontos, buscarPontos, removerPonto, atualizarPonto } from '../controller/pontosController.js';
import { autenticar } from '../middlewares/autenticacaoUsuario.js';
import { exigirEmpresa, exigirPapel } from '../middlewares/exigirPapel.js';

const router = express.Router();

router.use(autenticar, exigirPapel('gestor', 'colaborador'), exigirEmpresa);

router.get('/', buscarPontos);
router.post('/', criarPontos);
router.delete('/:id', exigirPapel('gestor'), removerPonto);
router.put('/:id', exigirPapel('gestor'), atualizarPonto);
export default router;
