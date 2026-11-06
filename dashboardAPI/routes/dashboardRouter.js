import express from 'express';
import { verDashboard, verRanking, baixarRankingXlsx } from '../controller/dashboardController.js';
import { autenticar } from '../middlewares/autenticacaoUsuario.js';
import { exigirEmpresa, exigirPapel } from '../middlewares/exigirPapel.js';

const router = express.Router();

router.use(autenticar, exigirPapel('gestor', 'colaborador'), exigirEmpresa);

router.get('/', verDashboard);
router.get('/ranking', verRanking);
router.get('/ranking/xlsx', exigirPapel('gestor'), baixarRankingXlsx);

export default router;
