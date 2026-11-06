# Dashboard API

## Deploy com empresas e níveis de acesso

Configure `MONGO_URI` e `JWT_SECRET` no ambiente da API. Para criar o primeiro administrador, configure também `ADMIN_NOME`, `ADMIN_EMAIL` e `ADMIN_SENHA` (mínimo de 8 caracteres).

Antes de subir a nova versão da API:

1. Faça backup do banco.
2. No diretório `dashboardAPI`, execute `npm run migrar:empresas` usando a URI do banco de produção. Usuários antigos sem CNPJ serão migrados para empresas sem CNPJ; CNPJs informados ainda precisam ter 14 caracteres após normalização. O script preserva os IDs usados por pontos e ações e mantém unicidade para CNPJs preenchidos; pode ser executado novamente sem duplicar empresas.
3. Implante a API e o front-end atualizados.
4. Se necessário, crie o administrador uma única vez com `npm run criar:admin`; depois, remova as variáveis `ADMIN_*` do ambiente.

O cadastro público cria uma empresa e seu primeiro gestor. Os administradores não são criados por rotas da API.
