import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { TERMOS_VERSAO, CONTROLADOR } from '@/lib/termos'

export const metadata = { title: 'Política de Privacidade — FinFlow' }

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <span className="text-xs text-muted-foreground">Versão {TERMOS_VERSAO}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Última atualização: 02 de junho de 2026 · Conforme Lei nº 13.709/2018 (LGPD)
        </p>

        <section className="space-y-6 text-sm leading-relaxed">
          <Bloco titulo="1. Controlador dos dados">
            <p>
              O FinFlow é operado por <strong>{CONTROLADOR.nome}</strong>, sob a marca <strong>{CONTROLADOR.marca}</strong>,
              e atua como <strong>controlador</strong> dos dados pessoais dos seus usuários credores (quem
              utiliza diretamente a plataforma). Para exercício de direitos ou esclarecimentos, contate
              o encarregado pelo e-mail <a className="underline" href={`mailto:${CONTROLADOR.email}`}>{CONTROLADOR.email}</a>.
            </p>
            <p className="mt-3">
              Em relação aos dados dos <strong>devedores/clientes finais</strong> (terceiros cadastrados
              pelos credores), o FinFlow atua como <strong>operador</strong> — o credor é o controlador
              desses dados e responsável pelas suas escolhas de tratamento.
            </p>
          </Bloco>

          <Bloco titulo="2. Dados que coletamos">
            <h3 className="font-medium text-foreground mt-4 mb-2">Dados do credor (titular usuário direto)</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Nome, e-mail e senha — para criação e autenticação da conta</li>
              <li>Telefone — opcional, para futuras notificações por WhatsApp</li>
              <li>Dados de uso da plataforma (logs de acesso, ações realizadas)</li>
              <li>Dados de pagamento — apenas confirmação de PIX recebido; não coletamos número de cartão</li>
            </ul>
            <h3 className="font-medium text-foreground mt-4 mb-2">Dados de clientes/devedores cadastrados pelo credor</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Nome, CPF, telefone, e-mail</li>
              <li>Documentos enviados pelo credor: RG, comprovante de residência, outros</li>
              <li>Histórico financeiro: empréstimos, parcelas, pagamentos, juros, status</li>
            </ul>
          </Bloco>

          <Bloco titulo="3. Para que usamos seus dados (finalidade)">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Operacional:</strong> criar e manter sua conta, oferecer as funcionalidades da plataforma, processar pagamentos e renovações, fornecer suporte.</li>
              <li><strong>Comunicação:</strong> enviar avisos importantes da conta (segurança, vencimentos, alterações de Termos) e, mediante seu consentimento, comunicações sobre o produto.</li>
              <li><strong>Segurança:</strong> prevenir fraudes, identificar acessos suspeitos, garantir a integridade da plataforma.</li>
              <li><strong>Cumprimento legal:</strong> atender obrigações da LGPD, do Marco Civil da Internet (Lei nº 12.965/2014) e demais leis aplicáveis.</li>
            </ul>
          </Bloco>

          <Bloco titulo="4. Bases legais utilizadas (Art. 7º da LGPD)">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Execução de contrato (Art. 7º, V):</strong> para os dados estritamente necessários para fornecer o serviço contratado.</li>
              <li><strong>Cumprimento de obrigação legal (Art. 7º, II):</strong> retenção mínima de logs e dados fiscais.</li>
              <li><strong>Consentimento (Art. 7º, I):</strong> para envio de comunicações de marketing e para envio de notificações por WhatsApp.</li>
              <li><strong>Legítimo interesse (Art. 7º, IX):</strong> para análise de uso anônima e prevenção a fraudes, ponderando seus direitos.</li>
              <li><strong>Proteção ao crédito (Art. 7º, X):</strong> para os dados financeiros e de identificação dos devedores cadastrados, sob responsabilidade do credor.</li>
            </ul>
          </Bloco>

          <Bloco titulo="5. Com quem compartilhamos">
            <p>Apenas com operadores estritamente necessários para a prestação do serviço:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Supabase Inc.</strong> — banco de dados, autenticação e armazenamento de arquivos (servidores nos EUA).</li>
              <li><strong>Vercel Inc.</strong> — hospedagem da aplicação web (servidores nos EUA).</li>
              <li><strong>Evolution API</strong> (hospedada no Railway) — envio das futuras notificações por WhatsApp, mediante seu consentimento expresso.</li>
              <li><strong>Google LLC</strong> — fontes web (Google Fonts) carregadas pelo navegador. O IP do usuário pode ser exposto ao Google nesse processo.</li>
            </ul>
            <p className="mt-3">
              Não comercializamos seus dados e não os compartilhamos com anunciantes, brokers de
              dados, redes sociais ou plataformas de publicidade. Eventuais transferências internacionais
              ocorrem com base no Art. 33 da LGPD, em jurisdições que ofereçam grau de proteção
              compatível com a legislação brasileira.
            </p>
          </Bloco>

          <Bloco titulo="6. Por quanto tempo guardamos">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Conta ativa:</strong> enquanto sua conta existir.</li>
              <li><strong>Após encerramento:</strong> dados pessoais identificáveis são eliminados em até 90 dias, exceto quando a lei exigir retenção maior (Marco Civil — logs por 6 meses; obrigações fiscais — 5 anos).</li>
              <li><strong>Documentos de devedores (RG, comprovantes):</strong> recomendamos que o credor exclua após o término do contrato + prazo prescricional aplicável. A exclusão pode ser feita manualmente na plataforma.</li>
              <li><strong>Backups:</strong> retidos por até 30 dias após exclusão para fins de recuperação.</li>
            </ul>
          </Bloco>

          <Bloco titulo="7. Seus direitos (Art. 18 da LGPD)">
            <p>Como titular, você pode, a qualquer momento e gratuitamente:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li>Confirmar se tratamos seus dados</li>
              <li>Acessar e obter cópia (inclusive em formato portável)</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade</li>
              <li>Solicitar portabilidade a outro fornecedor</li>
              <li>Revogar consentimento (quando o tratamento for baseado nele)</li>
              <li>Obter informação sobre compartilhamentos</li>
              <li>Apresentar reclamação à <a className="underline" href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">ANPD</a></li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer direito, envie e-mail para <a className="underline" href={`mailto:${CONTROLADOR.email}`}>{CONTROLADOR.email}</a>.
              Responderemos em até <strong>15 dias</strong>.
            </p>
          </Bloco>

          <Bloco titulo="8. Segurança">
            <p>
              Adotamos medidas técnicas e administrativas adequadas para proteger seus dados, incluindo:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li>Conexão HTTPS em todo o tráfego</li>
              <li>Senhas armazenadas com hash (não temos acesso à sua senha)</li>
              <li>Isolamento de dados entre credores via Row Level Security do PostgreSQL</li>
              <li>Acesso administrativo restrito por autenticação multifator</li>
              <li>URLs assinadas e temporárias para download de documentos</li>
              <li>Cookies de sessão HTTP-only e seguros</li>
            </ul>
            <p className="mt-3">
              Nenhum sistema é absolutamente imune. Em caso de incidente de segurança que possa
              acarretar risco relevante aos titulares, comunicaremos a ANPD em até 72 horas e, quando
              aplicável, os titulares afetados, conforme a Resolução CD/ANPD nº 15/2024.
            </p>
          </Bloco>

          <Bloco titulo="9. Cookies">
            <p>
              Utilizamos apenas cookies <strong>estritamente necessários</strong> para autenticação e
              funcionamento da plataforma. Não utilizamos cookies de marketing, rastreamento de
              terceiros ou ferramentas de analytics que identifiquem você individualmente.
            </p>
          </Bloco>

          <Bloco titulo="10. Crianças e adolescentes">
            <p>
              O FinFlow não se destina a menores de 18 anos. Não coletamos intencionalmente dados de
              crianças. Caso tomemos conhecimento de cadastro de menor, a conta será eliminada.
            </p>
          </Bloco>

          <Bloco titulo="11. Alterações desta Política">
            <p>
              Atualizações relevantes serão comunicadas por e-mail e/ou na própria plataforma. A
              versão vigente está sempre disponível em <code>/privacidade</code>, com a data de
              última atualização.
            </p>
          </Bloco>

          <Bloco titulo="12. Encarregado e contato">
            <p>
              Encarregado de Tratamento de Dados (DPO): <strong>{CONTROLADOR.nome}</strong> —
              <a className="underline ml-1" href={`mailto:${CONTROLADOR.email}`}>{CONTROLADOR.email}</a>
            </p>
          </Bloco>
        </section>

        <footer className="mt-12 pt-6 border-t text-xs text-muted-foreground">
          <p>
            Veja também os <Link className="underline" href="/termos">Termos de Uso</Link>.
          </p>
        </footer>
      </main>
    </div>
  )
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold mb-3 text-foreground">{titulo}</h2>
      <div className="text-muted-foreground space-y-2">{children}</div>
    </section>
  )
}
