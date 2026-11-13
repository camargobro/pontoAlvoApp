<template>
  <div class="pa-landing">

    <header class="pa-topo">
      <div class="pa-topo-interno">
        <svg class="pa-topo-logo" viewBox="0 0 640 160" role="img" aria-label="PontoAlvo" xmlns="http://www.w3.org/2000/svg">
          <path d="M70 150C70 150 20 100 20 70A50 50 0 1 1 120 70C120 100 70 150 70 150Z" fill="#0B3C5D" />
          <circle cx="70" cy="70" r="28" fill="#FFFFFF" />
          <circle cx="70" cy="70" r="18" fill="#FF7A1A" />
          <circle cx="70" cy="70" r="8" fill="#FFFFFF" />
          <text x="145" y="98" font-family="Poppins, 'Segoe UI', Roboto, Arial, sans-serif" font-size="68" font-weight="700" letter-spacing="-1">
            <tspan fill="#0B3C5D">Ponto</tspan><tspan fill="#FF7A1A">Alvo</tspan>
          </text>
        </svg>

        <nav class="pa-topo-nav gt-xs">
          <button
            v-for="item in itensMenu"
            :key="item.id"
            type="button"
            class="pa-link"
            :class="{ 'pa-link--ativo': secaoAtiva === item.id }"
            @click="irPara(item.id)"
          >
            {{ item.label }}
          </button>
        </nav>

        <q-btn outline no-caps color="primary" label="Entrar" to="/login" />
      </div>
    </header>

    <section id="inicio" class="pa-hero">
      <div class="pa-secao pa-hero-grade">

        <div class="pa-reveal">
          <h1 class="pa-hero-titulo">Descubra quais pontos geram mais vidas</h1>
          <p class="pa-hero-texto">
            Registre cada ação, compare a média de vidas por visita e decida onde vale a pena voltar.
          </p>
          <div class="pa-hero-acoes">
            <q-btn
              unelevated
              no-caps
              color="secondary"
              text-color="primary"
              size="lg"
              label="Começar agora"
              to="/cadastro"
            />
            <q-btn
              flat
              no-caps
              color="primary"
              size="lg"
              label="Ver como funciona"
              @click="irPara('como-funciona')"
            />
          </div>
        </div>

        <div class="pa-mock pa-reveal pa-reveal--preview" aria-hidden="true">
          <div class="pa-mock-titulo">Ranking de performance</div>
          <div class="pa-mock-sub">Média de vidas por visita</div>

          <div v-for="(linha, i) in exemplo" :key="linha.nome" class="pa-mock-linha">
            <span class="pa-mock-pos">{{ i + 1 }}</span>
            <span class="pa-mock-nome">{{ linha.nome }}</span>
            <span class="pa-mock-barra">
              <span class="pa-mock-barra-preenchida" :style="{ width: linha.largura }"></span>
            </span>
            <span class="pa-mock-valor">{{ linha.media }}</span>
          </div>

          <div class="pa-mock-nota">Exemplo ilustrativo</div>
        </div>

      </div>
    </section>

    <section id="funcionalidades" class="pa-bloco">
      <div class="pa-secao">
        <h2 class="pa-h2">Tudo para acompanhar suas ações na rua</h2>
        <p class="pa-h2-texto">
          Do cadastro do ponto ao ranking, sem planilhas espalhadas.
        </p>

        <div class="pa-grade-cards">
          <article
            v-for="(item, i) in funcionalidades"
            :key="item.titulo"
            class="pa-card pa-reveal"
            :style="{ '--pa-reveal-delay': `${i * 65}ms` }"
          >
            <h3 class="pa-card-titulo">{{ item.titulo }}</h3>
            <p class="pa-card-texto">{{ item.texto }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="dashboard" class="pa-bloco pa-bloco--claro">
      <div class="pa-secao pa-vitrine">

        <div class="pa-vitrine-texto pa-reveal">
          <h2 class="pa-h2">Um painel que mostra onde você gera mais vidas</h2>
          <p class="pa-vitrine-paragrafo">
            Veja em um só lugar o total de ações, de vidas e de leads, e descubra qual ponto tem a melhor
            e a pior média de vidas por visita.
          </p>
          <ul class="pa-lista">
            <li v-for="item in beneficiosDashboard" :key="item">{{ item }}</li>
          </ul>
        </div>

        <div class="pa-mock pa-dash pa-reveal pa-reveal--preview" aria-hidden="true">
          <div class="pa-dash-kpis">
            <div v-for="kpi in kpis" :key="kpi.label" class="pa-kpi">
              <div class="pa-mock-sub">{{ kpi.label }}</div>
              <div class="pa-kpi-valor">{{ kpi.valor }}</div>
            </div>
          </div>

          <div class="pa-dash-destaques">
            <div
              v-for="d in destaquesExemplo"
              :key="d.chave"
              class="pa-destaque"
              :class="`pa-destaque--${d.chave}`"
            >
              <div class="pa-destaque-titulo">{{ d.titulo }}</div>
              <div class="pa-destaque-linha">
                <div>
                  <div class="pa-destaque-nome">{{ d.nome }}</div>
                  <div class="pa-mock-sub">{{ d.endereco }}</div>
                </div>
                <div class="pa-destaque-media">{{ d.media }}</div>
              </div>
              <div class="pa-destaque-stats">
                <span>Visitas <strong>{{ d.visitas }}</strong></span>
                <span>Vidas <strong>{{ d.vendas }}</strong></span>
                <span>Leads <strong>{{ d.leads }}</strong></span>
                <span>Consultas <strong>{{ d.telemedicina }}</strong></span>
              </div>
            </div>
          </div>

          <div class="pa-mock-titulo pa-dash-ranking-titulo">Ranking de performance</div>
          <div v-for="(linha, i) in exemplo.slice(0, 3)" :key="linha.nome" class="pa-mock-linha">
            <span class="pa-mock-pos">{{ i + 1 }}</span>
            <span class="pa-mock-nome">{{ linha.nome }}</span>
            <span class="pa-mock-barra">
              <span class="pa-mock-barra-preenchida" :style="{ width: linha.largura }"></span>
            </span>
            <span class="pa-mock-valor">{{ linha.media }}</span>
          </div>

          <div class="pa-mock-nota">Exemplo ilustrativo, com dados fictícios</div>
        </div>

      </div>
    </section>

    <section id="pontos" class="pa-bloco">
      <div class="pa-secao pa-vitrine pa-vitrine--invertida">

        <div class="pa-vitrine-texto pa-reveal">
          <h2 class="pa-h2">Cadastre cada ponto com todas as informações</h2>
          <p class="pa-vitrine-paragrafo">
            Guarde nome, tipo, telefone, endereço, bairro e cidade de cada ponto. Se precisar de um ponto novo
            no meio do registro de uma ação, crie na hora, sem sair da tela.
          </p>
          <ul class="pa-lista">
            <li v-for="item in beneficiosPontos" :key="item">{{ item }}</li>
          </ul>
        </div>

        <div class="pa-mock pa-reveal pa-reveal--preview" aria-hidden="true">
          <div class="pa-mock-titulo">Novo ponto</div>
          <div class="pa-mock-sub">O ponto será selecionado automaticamente na ação.</div>

          <div class="pa-form">
            <div class="pa-campo pa-campo--8">
              <span class="pa-campo-label">Nome do ponto</span>
              <span class="pa-campo-valor">Ponto Praça Central</span>
            </div>
            <div class="pa-campo pa-campo--4">
              <span class="pa-campo-label">Tipo</span>
              <span class="pa-campo-valor">Banca</span>
            </div>
            <div class="pa-campo pa-campo--12">
              <span class="pa-campo-label">Telefone</span>
              <span class="pa-campo-valor">(00) 00000-0000</span>
            </div>
            <div class="pa-campo pa-campo--12">
              <span class="pa-campo-label">Endereço</span>
              <span class="pa-campo-valor">Rua Exemplo, 123</span>
            </div>
            <div class="pa-campo pa-campo--6">
              <span class="pa-campo-label">Bairro</span>
              <span class="pa-campo-valor">Centro</span>
            </div>
            <div class="pa-campo pa-campo--6">
              <span class="pa-campo-label">Cidade</span>
              <span class="pa-campo-valor">Cidade Exemplo</span>
            </div>
          </div>

          <div class="pa-form-acoes">
            <span class="pa-botao-falso">Cancelar</span>
            <span class="pa-botao-falso pa-botao-falso--primario">Salvar ponto</span>
          </div>

          <div class="pa-mock-nota">Exemplo ilustrativo, com dados fictícios</div>
        </div>

      </div>
    </section>

    <section id="historico" class="pa-bloco pa-bloco--claro">
      <div class="pa-secao pa-vitrine">

        <div class="pa-vitrine-texto pa-reveal">
          <h2 class="pa-h2">Todo o histórico de ações, do mais recente ao mais antigo</h2>
          <p class="pa-vitrine-paragrafo">
            Consulte cada ação registrada com ponto, data, leads e vidas. A cor do número de vidas mostra
            de relance quais ações foram fracas, medianas ou boas.
          </p>
          <ul class="pa-lista">
            <li v-for="item in beneficiosHistorico" :key="item">{{ item }}</li>
          </ul>
        </div>

        <div class="pa-mock pa-reveal pa-reveal--preview" aria-hidden="true">
          <div class="pa-mock-sub pa-hist-legenda">
            Cor das vidas:
            <span class="pa-vendas--zero">0</span>,
            <span class="pa-vendas--baixa">de 1 a 4</span>,
            <span class="pa-vendas--boa">5 ou mais</span>
          </div>

          <table class="pa-hist">
            <thead>
              <tr>
                <th>Ponto</th>
                <th>Data</th>
                <th class="pa-centro">Leads</th>
                <th class="pa-centro">Consultas</th>
                <th class="pa-centro">Vidas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(acao, i) in historicoExemplo" :key="i">
                <td>
                  <div class="pa-destaque-nome">{{ acao.ponto }}</div>
                  <div class="pa-mock-sub">{{ acao.endereco }}</div>
                </td>
                <td>{{ acao.data }}</td>
                <td class="pa-centro">{{ acao.leads }}</td>
                <td class="pa-centro">{{ acao.telemedicina }}</td>
                <td class="pa-centro">
                  <span class="pa-vendas" :class="`pa-vendas--${acao.nivel}`">{{ acao.vendas }}</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="pa-mock-nota">Exemplo ilustrativo, com dados fictícios</div>
        </div>

      </div>
    </section>

    <section id="como-funciona" class="pa-bloco">
      <div class="pa-secao">
        <h2 class="pa-h2">Como funciona</h2>

        <div class="pa-passos">
          <div
            v-for="(passo, i) in passos"
            :key="passo.titulo"
            class="pa-passo pa-reveal"
            :style="{ '--pa-reveal-delay': `${i * 90}ms` }"
          >
            <div class="pa-passo-numero">{{ i + 1 }}</div>
            <h3 class="pa-card-titulo">{{ passo.titulo }}</h3>
            <p class="pa-card-texto">{{ passo.texto }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="pa-cta">
      <div class="pa-secao pa-cta-interno pa-reveal">
        <h2 class="pa-cta-titulo">Pronto para gerar mais vidas?</h2>
        <div class="pa-hero-acoes">
          <q-btn
            unelevated
            no-caps
            color="secondary"
            text-color="primary"
            size="lg"
            label="Começar agora"
            to="/cadastro"
          />
        </div>
      </div>
    </section>

    <footer class="pa-rodape">
      <div class="pa-secao pa-rodape-interno">
        <svg class="pa-rodape-logo" viewBox="0 0 640 160" role="img" aria-label="PontoAlvo" xmlns="http://www.w3.org/2000/svg">
          <path d="M70 150C70 150 20 100 20 70A50 50 0 1 1 120 70C120 100 70 150 70 150Z" fill="#0B3C5D" />
          <circle cx="70" cy="70" r="28" fill="#FFFFFF" />
          <circle cx="70" cy="70" r="18" fill="#FF7A1A" />
          <circle cx="70" cy="70" r="8" fill="#FFFFFF" />
          <text x="145" y="98" font-family="Poppins, 'Segoe UI', Roboto, Arial, sans-serif" font-size="68" font-weight="700" letter-spacing="-1">
            <tspan fill="#0B3C5D">Ponto</tspan><tspan fill="#FF7A1A">Alvo</tspan>
          </text>
        </svg>
        <span>© {{ ano }} PontoAlvo</span>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const ALTURA_TOPO = 68

const ano = new Date().getFullYear()
const secaoAtiva = ref('')

const itensMenu = [
  { id: 'funcionalidades', label: 'Funcionalidades' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'como-funciona', label: 'Como funciona' }
]

const idsSecoes = ['inicio', 'funcionalidades', 'dashboard', 'pontos', 'historico', 'como-funciona']

const exemplo = [
  { nome: 'Ponto A', media: '6,40', largura: '100%' },
  { nome: 'Ponto B', media: '4,85', largura: '76%' },
  { nome: 'Ponto C', media: '3,10', largura: '48%' },
  { nome: 'Ponto D', media: '1,25', largura: '20%' }
]

const kpis = [
  { label: 'Total de ações', valor: '128' },
  { label: 'Total de vidas', valor: '342' },
  { label: 'Total de leads', valor: '1.025' },
  { label: 'Total de consultas', valor: '286' }
]

const destaquesExemplo = [
  {
    chave: 'melhor',
    titulo: 'Melhor ponto',
    nome: 'Ponto A',
    endereco: 'Rua Exemplo, 123',
    media: '6,40',
    visitas: '32',
    vendas: '205',
    leads: '410',
    telemedicina: '190'
  },
  {
    chave: 'pior',
    titulo: 'Pior ponto',
    nome: 'Ponto D',
    endereco: 'Av. Modelo, 456',
    media: '1,25',
    visitas: '28',
    vendas: '35',
    leads: '120',
    telemedicina: '24'
  }
]

const historicoExemplo = [
  { ponto: 'Ponto A', endereco: 'Rua Exemplo, 123', data: '30/09/2026', leads: 14, telemedicina: 8, vendas: 8, nivel: 'boa' },
  { ponto: 'Ponto B', endereco: 'Rua Teste, 78', data: '29/09/2026', leads: 9, telemedicina: 4, vendas: 3, nivel: 'baixa' },
  { ponto: 'Ponto D', endereco: 'Av. Modelo, 456', data: '29/09/2026', leads: 6, telemedicina: 0, vendas: 0, nivel: 'zero' },
  { ponto: 'Ponto A', endereco: 'Rua Exemplo, 123', data: '28/09/2026', leads: 11, telemedicina: 7, vendas: 6, nivel: 'boa' }
]

const funcionalidades = [
  {
    titulo: 'Registro rápido de ações',
    texto: 'Informe o ponto, a data, os leads, as vidas e as consultas em poucos campos, direto do celular ou do computador.'
  },
  {
    titulo: 'Cadastro de pontos',
    texto: 'Telefone, endereço, bairro, cidade e tipo de cada ponto, organizados e sempre à mão.'
  },
  {
    titulo: 'Dashboard e ranking',
    texto: 'Totais de ações, vidas e leads, melhor e pior ponto e o ranking pela média de vidas por visita.'
  },
  {
    titulo: 'Histórico de ações',
    texto: 'Todas as ações registradas, da mais recente para a mais antiga, com a cor das vidas para leitura rápida.'
  },
  {
    titulo: 'Exportação em planilha',
    texto: 'Leve o ranking para uma planilha quando precisar compartilhar ou analisar fora do sistema.'
  },
  {
    titulo: 'Acesso com login',
    texto: 'Cada pessoa entra com e-mail e senha, e os dados ficam protegidos atrás do login.'
  }
]

const beneficiosDashboard = [
  'Totais de ações, vidas e leads em destaque',
  'Melhor e pior ponto lado a lado, com visitas, vidas e leads',
  'Ranking completo ordenado pela média de vidas por visita',
  'Exportação do ranking em planilha'
]

const beneficiosPontos = [
  'Cadastro rápido, sem sair do registro da ação',
  'Lista com todos os pontos, com busca e ordenação',
  'Telefone, endereço, bairro, cidade e tipo de cada ponto'
]

const beneficiosHistorico = [
  'Ordenado da ação mais recente para a mais antiga',
  'Exclusão de ações registradas por engano, com confirmação',
  'Paginação para navegar em históricos longos'
]

const passos = [
  { titulo: 'Cadastre os pontos', texto: 'Registre os locais onde você realiza ações de campo.' },
  { titulo: 'Registre cada ação', texto: 'A cada visita, informe quantos leads e quantas vidas foram geradas.' },
  { titulo: 'Acompanhe o ranking', texto: 'O painel mostra onde vale voltar e onde vale rever a estratégia.' }
]

let quadro = null
let rolando = false
let observador = null
let observadorRevelacao = null

function pararRolagem() {
  cancelAnimationFrame(quadro)
  window.removeEventListener('wheel', pararRolagem)
  window.removeEventListener('touchstart', pararRolagem)
  rolando = false
}

function irPara(id) {
  const secao = document.getElementById(id)
  if (!secao) return

  const inicio = window.scrollY
  const destino = secao.getBoundingClientRect().top + inicio - ALTURA_TOPO + 1
  const distancia = destino - inicio
  const duracao = Math.min(1200, Math.max(500, Math.abs(distancia) * 0.5))
  const t0 = performance.now()

  pararRolagem()
  rolando = true
  secaoAtiva.value = id
  window.addEventListener('wheel', pararRolagem, { passive: true })
  window.addEventListener('touchstart', pararRolagem, { passive: true })

  function passo(agora) {
    const progresso = Math.min((agora - t0) / duracao, 1)
    const suave = progresso < 0.5
      ? 4 * progresso ** 3
      : 1 - (-2 * progresso + 2) ** 3 / 2

    window.scrollTo({ top: inicio + distancia * suave, behavior: 'instant' })

    if (progresso < 1) {
      quadro = requestAnimationFrame(passo)
    } else {
      pararRolagem()
    }
  }

  quadro = requestAnimationFrame(passo)
}

onMounted(() => {
  observador = new IntersectionObserver(
    (entradas) => {
      if (rolando) return
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) secaoAtiva.value = entrada.target.id
      })
    },
    { rootMargin: '-40% 0px -55% 0px' }
  )

  idsSecoes.forEach((id) => {
    const secao = document.getElementById(id)
    if (secao) observador.observe(secao)
  })

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    observadorRevelacao = new IntersectionObserver((entradas, observer) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('pa-reveal--visivel')
          observer.unobserve(entrada.target)
        }
      })
    }, { threshold: 0.14, rootMargin: '0px 0px -36px 0px' })

    document.querySelectorAll('.pa-landing .pa-reveal').forEach((elemento) => {
      observadorRevelacao.observe(elemento)
    })
  }
})

onBeforeUnmount(() => {
  pararRolagem()
  observador?.disconnect()
  observadorRevelacao?.disconnect()
})
</script>

<style scoped>
.pa-landing {
  --pa-navy: #0B3C5D;
  --pa-orange: #FF7A1A;
  --pa-suave: #5F6B7A;
  --pa-borda: #E3E8EE;
  --pa-bom: #2E7D32;
  --pa-alerta: #B26A00;
  --pa-ruim: #C62828;

  background: #fff;
  color: var(--pa-navy);
}

@media (prefers-reduced-motion: no-preference) {
  .pa-reveal {
    opacity: 0;
    transform: translateY(18px);
    transition:
      opacity 560ms ease,
      transform 560ms cubic-bezier(0.2, 0.7, 0.2, 1);
    transition-delay: var(--pa-reveal-delay, 0ms);
  }

  .pa-reveal--preview {
    transform: translateY(26px) scale(0.985);
  }

  .pa-reveal--visivel {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .pa-mock-barra-preenchida {
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 720ms cubic-bezier(0.2, 0.7, 0.2, 1);
    transition-delay: 160ms;
  }

  .pa-reveal--visivel .pa-mock-barra-preenchida {
    transform: scaleX(1);
  }
}

.pa-secao {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px;
}

.pa-topo {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid var(--pa-borda);
}

.pa-topo-interno {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  max-width: 1120px;
  height: 68px;
  margin: 0 auto;
  padding: 0 24px;
}

.pa-topo-logo {
  width: 150px;
  height: auto;
}

.pa-topo-nav {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.pa-link {
  position: relative;
  padding: 8px 12px;
  border: 0;
  border-radius: 8px;
  background: none;
  font: inherit;
  font-weight: 500;
  color: var(--pa-suave);
  cursor: pointer;
  transition: color 0.25s ease, background 0.25s ease;
}

.pa-link::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 2px;
  height: 2px;
  border-radius: 2px;
  background: var(--pa-orange);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s ease;
}

.pa-link:hover {
  color: var(--pa-navy);
  background: #F4F6F9;
}

.pa-link--ativo {
  color: var(--pa-navy);
}

.pa-link--ativo::after {
  transform: scaleX(1);
}

.pa-link:focus-visible {
  outline: 2px solid var(--pa-orange);
  outline-offset: 2px;
}

.pa-hero {
  padding: 72px 0 88px;
  background: #F4F6F9;
}

.pa-hero-grade {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 48px;
  align-items: center;
}

.pa-hero-titulo {
  margin: 0 0 20px;
  font-size: clamp(2rem, 4.5vw, 3.25rem);
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.pa-hero-texto {
  max-width: 520px;
  margin: 0 0 32px;
  font-size: 1.1875rem;
  line-height: 1.55;
  color: var(--pa-suave);
}

.pa-hero-acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.pa-mock {
  padding: 24px;
  background: #fff;
  border: 1px solid var(--pa-borda);
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(11, 60, 93, 0.12);
}

.pa-mock-titulo {
  font-size: 1.125rem;
  font-weight: 700;
}

.pa-mock-sub {
  margin-bottom: 20px;
  font-size: 0.8125rem;
  color: var(--pa-suave);
}

.pa-mock-linha {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid var(--pa-borda);
}

.pa-mock-pos {
  width: 16px;
  font-weight: 700;
  color: var(--pa-suave);
}

.pa-mock-nome {
  width: 64px;
  font-weight: 700;
}

.pa-mock-barra {
  flex: 1;
  height: 8px;
  background: #EEF1F5;
  border-radius: 4px;
  overflow: hidden;
}

.pa-mock-barra-preenchida {
  display: block;
  height: 100%;
  background: var(--pa-orange);
  border-radius: 4px;
}

.pa-mock-valor {
  min-width: 40px;
  text-align: right;
  font-weight: 700;
}

.pa-mock-nota {
  margin-top: 12px;
  font-size: 0.75rem;
  color: var(--pa-suave);
}

.pa-bloco {
  padding: 88px 0;
}

.pa-bloco--claro {
  background: #F4F6F9;
}

.pa-h2 {
  margin: 0 0 12px;
  font-size: clamp(1.625rem, 3vw, 2.25rem);
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.pa-h2-texto {
  margin: 0 0 40px;
  font-size: 1.0625rem;
  color: var(--pa-suave);
}

.pa-grade-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.pa-card {
  padding: 24px;
  background: #fff;
  border: 1px solid var(--pa-borda);
  border-radius: 12px;
}

.pa-card-titulo {
  margin: 0 0 8px;
  font-size: 1.125rem;
  font-weight: 700;
}

.pa-card-texto {
  margin: 0;
  line-height: 1.55;
  color: var(--pa-suave);
}

.pa-vitrine {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 56px;
  align-items: center;
}

.pa-vitrine-paragrafo {
  margin: 0;
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--pa-suave);
}

.pa-lista {
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
}

.pa-lista li {
  position: relative;
  margin-bottom: 10px;
  padding-left: 22px;
  line-height: 1.5;
}

.pa-lista li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5em;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--pa-orange);
}

.pa-dash-kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.pa-kpi {
  padding: 14px 16px;
  border: 1px solid var(--pa-borda);
  border-radius: 10px;
}

.pa-kpi .pa-mock-sub {
  margin-bottom: 4px;
}

.pa-kpi-valor {
  font-size: 1.5rem;
  line-height: 1.2;
  font-weight: 700;
}

.pa-dash-destaques {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.pa-destaque {
  padding: 14px 16px;
  border: 1px solid var(--pa-borda);
  border-left: 4px solid var(--pa-cor);
  border-radius: 10px;
}

.pa-destaque--melhor {
  --pa-cor: var(--pa-bom);
}

.pa-destaque--pior {
  --pa-cor: var(--pa-ruim);
}

.pa-destaque-titulo {
  margin-bottom: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--pa-cor);
}

.pa-destaque-linha {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.pa-destaque-linha .pa-mock-sub {
  margin-bottom: 0;
}

.pa-destaque-nome {
  font-weight: 700;
}

.pa-destaque-media {
  font-size: 1.5rem;
  line-height: 1.1;
  font-weight: 700;
  color: var(--pa-cor);
}

.pa-destaque-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--pa-borda);
  font-size: 0.8125rem;
  color: var(--pa-suave);
}

.pa-destaque-stats strong {
  color: var(--pa-navy);
}

.pa-dash-ranking-titulo {
  margin-bottom: 8px;
}

.pa-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.pa-campo {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 14px;
  border: 1px solid #C9D1DB;
  border-radius: 6px;
}

.pa-campo--12 {
  flex: 1 1 100%;
}

.pa-campo--8 {
  flex: 2 1 55%;
}

.pa-campo--4 {
  flex: 1 1 28%;
}

.pa-campo--6 {
  flex: 1 1 40%;
}

.pa-campo-label {
  font-size: 0.75rem;
  color: var(--pa-suave);
}

.pa-campo-valor {
  font-weight: 500;
}

.pa-form-acoes {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.pa-botao-falso {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--pa-suave);
}

.pa-botao-falso--primario {
  color: #fff;
  background: var(--pa-navy);
}

.pa-hist {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.pa-hist th {
  padding: 10px 8px;
  font-size: 0.8125rem;
  font-weight: 700;
  background: #F8FAFC;
}

.pa-hist td {
  padding: 12px 8px;
  border-top: 1px solid var(--pa-borda);
  vertical-align: top;
}

.pa-hist .pa-mock-sub {
  margin-bottom: 0;
}

.pa-centro {
  text-align: center !important;
}

.pa-hist-legenda {
  margin-bottom: 16px;
}

.pa-vendas {
  font-size: 1.125rem;
  font-weight: 700;
}

.pa-vendas--zero {
  color: var(--pa-ruim);
  font-weight: 700;
}

.pa-vendas--baixa {
  color: var(--pa-alerta);
  font-weight: 700;
}

.pa-vendas--boa {
  color: var(--pa-bom);
  font-weight: 700;
}

.pa-passos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 32px;
  margin-top: 40px;
}

.pa-passo-numero {
  margin-bottom: 12px;
  font-size: 3rem;
  line-height: 1;
  font-weight: 700;
  color: var(--pa-orange);
}

.pa-cta {
  padding: 72px 0;
  color: #fff;
  background: var(--pa-navy);
}

.pa-cta-interno {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.pa-cta-titulo {
  margin: 0;
  max-width: 520px;
  font-size: clamp(1.625rem, 3vw, 2.25rem);
  line-height: 1.2;
  font-weight: 700;
}

.pa-rodape {
  padding: 28px 0;
  font-size: 0.875rem;
  color: var(--pa-suave);
}

.pa-rodape-interno {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pa-rodape-logo {
  width: 110px;
  height: auto;
}

@media (min-width: 901px) {
  .pa-vitrine--invertida {
    grid-template-columns: 1.1fr 0.9fr;
  }

  .pa-vitrine--invertida .pa-vitrine-texto {
    order: 2;
  }
}

@media (max-width: 900px) {
  .pa-hero {
    padding: 48px 0 56px;
  }

  .pa-hero-grade,
  .pa-vitrine {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .pa-bloco {
    padding: 56px 0;
  }
}

@media (max-width: 520px) {
  .pa-dash-kpis,
  .pa-dash-destaques {
    grid-template-columns: 1fr;
  }
}
</style>