export function exigirPapel(...papeis) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Autenticação necessária' });
    }

    if (!papeis.includes(req.usuario.papel)) {
      return res.status(403).json({ error: 'Você não tem permissão para esta ação' });
    }

    return next();
  };
}

export function exigirEmpresa(req, res, next) {
  if (!req.empresaId) {
    return res.status(403).json({ error: 'Esta operação exige uma empresa vinculada' });
  }

  return next();
}
