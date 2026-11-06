import express from 'express';
import {
  atualizarUsuario,
  apagarUsuario,
  buscarUsuarios,
  criarUsuario,
  login,
  registrarEmpresa
} from '../controller/usuariosController.js';
import { autenticar } from '../middlewares/autenticacaoUsuario.js';
import { exigirEmpresa, exigirPapel } from '../middlewares/exigirPapel.js';
import { limitarCadastro, limitarLogin } from '../middlewares/limiteRequisicoes.js';

const router = express.Router();

router.post('/registrar', limitarCadastro, registrarEmpresa);
router.post('/login', limitarLogin, login);

router.use(autenticar);
router.get('/', exigirPapel('gestor'), exigirEmpresa, buscarUsuarios);
router.post('/', exigirPapel('gestor'), exigirEmpresa, criarUsuario);
router.put('/:id', exigirPapel('gestor'), exigirEmpresa, atualizarUsuario);
router.delete('/:id', exigirPapel('gestor'), exigirEmpresa, apagarUsuario);

export default router;
