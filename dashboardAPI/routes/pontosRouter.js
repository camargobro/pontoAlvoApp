import express from 'express';
import { criarPontos, buscarPontos, removerPonto, atualizarPonto, buscarMapaCalor, buscarPontoPorId } from '../controller/pontosController.js';
import { autenticar } from '../middlewares/autenticacaoUsuario.js';
import { exigirEmpresa, exigirPapel } from '../middlewares/exigirPapel.js';

const router = express.Router();

router.use(autenticar, exigirPapel('gestor', 'colaborador'), exigirEmpresa);

router.get('/', buscarPontos);
router.get('/mapa-calor', buscarMapaCalor);
router.get('/:id', buscarPontoPorId);
router.post('/', criarPontos);
router.delete('/:id', exigirPapel('gestor'), removerPonto);
router.put('/:id', exigirPapel('gestor'), atualizarPonto);
export default router;