import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import 'dotenv/config';
import { Usuario } from '../model/modelUsuario.js';

export async function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não informado' });
  }

  const [tipo, token] = authHeader.split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Formato do token inválido' });
  }

  let claims;
  try {
    claims = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }

  if (!claims || typeof claims.usuarioId !== 'string' || !mongoose.isValidObjectId(claims.usuarioId)) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }

  try {
    const usuario = await Usuario.findById(claims.usuarioId).select('_id papel empresaId');
    if (!usuario || !['admin', 'gestor', 'colaborador'].includes(usuario.papel)) {
      return res.status(401).json({ error: 'Usuário não encontrado ou sem papel válido' });
    }

    req.usuario = {
      id: String(usuario._id),
      papel: usuario.papel,
      empresaId: usuario.empresaId
    };
    req.empresaId = usuario.empresaId;
    return next();
  } catch (error) {
    return next(error);
  }
}
