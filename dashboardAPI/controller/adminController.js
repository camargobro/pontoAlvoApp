import { getEmpresas, getEmpresa } from '../model/modelEmpresa.js';
import { Acoes } from '../model/modelAcao.js';
import { Pontos } from '../model/modelPonto.js';
import { contarUsuarios, getUsuarios } from '../model/modelUsuario.js';

function usuarioSeguro(usuario) {
  return {
    id: String(usuario._id),
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    empresaId: usuario.empresaId
  };
}

export async function buscarEmpresas(req, res) {
  try {
    const empresas = await getEmpresas();
    const resultado = await Promise.all(empresas.map(async (empresa) => {
      const empresaId = String(empresa._id);
      const [usuarios, pontos, acoes] = await Promise.all([
        contarUsuarios(empresaId),
        Pontos.countDocuments({ empresaId }),
        Acoes.countDocuments({ empresaId })
      ]);

      return {
        ...empresa,
        totais: {
          usuarios,
          pontos,
          acoes
        }
      };
    }));

    return res.status(200).json(resultado);
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    return res.status(500).json({ error: 'Erro ao listar empresas' });
  }
}

export async function buscarUsuariosEmpresa(req, res) {
  try {
    const empresa = await getEmpresa(req.params.id);
    if (!empresa) return res.status(404).json({ error: 'Empresa não encontrada' });

    const usuarios = await getUsuarios(String(empresa._id));
    return res.status(200).json(usuarios.map(usuarioSeguro));
  } catch (error) {
    if (error.name === 'CastError') return res.status(404).json({ error: 'Empresa não encontrada' });
    console.error('Erro ao listar usuários da empresa:', error);
    return res.status(500).json({ error: 'Erro ao listar usuários da empresa' });
  }
}
