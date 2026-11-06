import express from 'express';
import { buscarEmpresas, buscarUsuariosEmpresa } from '../controller/adminController.js';
import { autenticar } from '../middlewares/autenticacaoUsuario.js';
import { exigirPapel } from '../middlewares/exigirPapel.js';

const router = express.Router();

router.use(autenticar, exigirPapel('admin'));
router.get('/empresas', buscarEmpresas);
router.get('/empresas/:id/usuarios', buscarUsuariosEmpresa);

export default router;
