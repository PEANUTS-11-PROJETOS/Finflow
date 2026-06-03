import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { TERMOS_VERSAO, CONTROLADOR } from '@/lib/termos'

export const metadata = { title: 'Termos de Uso — FinFlow' }

export default function TermosPage() {
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

      <main className="max-w-3xl mx-auto px-6 py-10 prose-finflow">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Termos de Uso</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Última atualização: 02 de junho de 2026 · Vigência a partir desta data
        </p>

        <section className="space-y-6 text-sm leading-relaxed">
          <Bloco titulo="1. Quem somos">
            <p>
              O FinFlow é uma plataforma de gestão de empréstimos operada por <strong>{CONTROLADOR.nome}</strong>,
              pessoa física, sob a marca <strong>{CONTROLADOR.marca}</strong>. Para contato relativo a estes
              Termos ou à Política de Privacidade, utilize o e-mail <a className="underline" href={`mailto:${CONTROLADOR.email}`}>{CONTROLADOR.email}</a>.
              Documentos de identificação do operador (CPF) podem ser solicitados por esse mesmo canal.
            </p>
          </Bloco>

          <Bloco titulo="2. Objeto">
            <p>
              O FinFlow oferece ferramentas digitais para que pessoas físicas (credores) registrem
              clientes (devedores), criem e acompanhem empréstimos do tipo <em>price</em> e <em>renovável</em>,
              recebam indicadores e mantenham histórico financeiro próprio. Não somos instituição
              financeira, não intermediamos pagamentos entre credor e devedor, não emitimos contratos
              de crédito e não substituímos a assessoria jurídica ou contábil que sua operação possa exigir.
            </p>
          </Bloco>

          <Bloco titulo="3. Cadastro e elegibilidade">
            <ul className="list-disc pl-5 space-y-2">
              <li>Você declara ter <strong>18 anos ou mais</strong> e capacidade civil plena.</li>
              <li>Os dados do cadastro devem ser verdadeiros, completos e atualizados.</li>
              <li>A conta é pessoal e intransferível. Você é responsável pela guarda das credenciais.</li>
              <li>Cadastros novos passam por aprovação do administrador antes do acesso completo.</li>
            </ul>
          </Bloco>

          <Bloco titulo="4. Período de teste e planos">
            <ul className="list-disc pl-5 space-y-2">
              <li>Todo novo credor recebe <strong>30 dias de teste gratuito</strong> com acesso integral à plataforma.</li>
              <li>Após esse período, é necessário ativar um plano para continuar usando.</li>
              <li>Há um único plano com dois ciclos de cobrança: mensal ou anual.</li>
              <li>A cobrança é feita via PIX manual após contato pelo canal indicado no aplicativo. <strong>Não há renovação automática</strong>: a renovação só ocorre mediante nova confirmação de pagamento.</li>
              <li>Não há reembolso proporcional por períodos pagos antecipadamente. Você pode cancelar a qualquer momento simplesmente não renovando o plano.</li>
            </ul>
          </Bloco>

          <Bloco titulo="5. Sua responsabilidade sobre dados de terceiros">
            <p>
              Ao cadastrar clientes (devedores) no FinFlow, você inclui dados pessoais de outras pessoas
              (nome, CPF, telefone, endereço, documentos). Você é o <strong>controlador desses dados</strong>
              perante a LGPD em relação a esses titulares e se compromete a:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Coletar e tratar esses dados apenas com base legal compatível (proteção ao crédito, execução de contrato, consentimento, conforme o caso) — Art. 7º da Lei nº 13.709/2018.</li>
              <li>Manter os dados atualizados, exatos e limitados ao necessário para a finalidade declarada.</li>
              <li>Atender solicitações dos titulares (acesso, retificação, eliminação, portabilidade, anonimização — Art. 18 da LGPD).</li>
              <li>Não utilizar a plataforma para práticas ilegais, incluindo cobrança vexatória, ameaças, divulgação indevida de dívida ou qualquer outra conduta vedada pelo Código de Defesa do Consumidor e demais leis aplicáveis.</li>
              <li>Cobrar juros e encargos dentro dos limites legais. Operações que configurem usura ou crime previsto na Lei da Usura (Decreto nº 22.626/1933) ou no Art. 4º da Lei nº 1.521/1951 são de sua exclusiva responsabilidade.</li>
            </ul>
            <p className="mt-3">
              O FinFlow atua como <strong>operador</strong> desses dados, processando-os exclusivamente
              conforme suas instruções e nos limites técnicos e contratuais aqui estabelecidos.
            </p>
          </Bloco>

          <Bloco titulo="6. Uso permitido e vedações">
            <p>É vedado, sob pena de suspensão imediata da conta:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Utilizar a plataforma para qualquer atividade ilegal, fraudulenta ou que viole direitos de terceiros.</li>
              <li>Tentar acessar dados de outros credores, burlar mecanismos de segurança, fazer engenharia reversa, scraping em massa ou ataques automatizados.</li>
              <li>Compartilhar credenciais, criar contas falsas ou múltiplas em nome de terceiros.</li>
              <li>Redistribuir, revender, sublicenciar ou comercializar o acesso à plataforma para terceiros sem autorização escrita.</li>
            </ul>
          </Bloco>

          <Bloco titulo="7. Suspensão e encerramento">
            <p>
              Podemos suspender ou encerrar a sua conta a qualquer momento, com ou sem aviso prévio,
              em caso de violação destes Termos, ordem judicial ou risco à integridade da plataforma
              e dos demais usuários. Em caso de encerramento da sua conta pelo seu próprio pedido, seus
              dados serão tratados conforme a Política de Privacidade.
            </p>
          </Bloco>

          <Bloco titulo="8. Propriedade intelectual">
            <p>
              Todo o conteúdo da plataforma (código, design, marca, textos, identidade visual) pertence
              a {CONTROLADOR.nome} / {CONTROLADOR.marca}. Você recebe uma licença limitada, não exclusiva
              e revogável para usar o FinFlow conforme estes Termos. Os dados que você cadastra continuam
              sendo seus.
            </p>
          </Bloco>

          <Bloco titulo="9. Disponibilidade e limitação de responsabilidade">
            <p>
              A plataforma é fornecida no estado em que se encontra, sem garantias de disponibilidade
              ininterrupta. Eventuais indisponibilidades por manutenção, atualizações ou falhas de
              terceiros (Supabase, Vercel, Evolution API, provedores de Internet) não geram direito a
              indenização. Recomendamos que você exporte regularmente seus dados (recurso disponível
              dentro da plataforma).
            </p>
            <p className="mt-3">
              Não nos responsabilizamos por decisões financeiras tomadas com base nas informações
              exibidas, pela qualidade da relação entre você e seus clientes, ou por consequências
              jurídicas de operações irregulares de crédito conduzidas por usuários.
            </p>
          </Bloco>

          <Bloco titulo="10. Alterações destes Termos">
            <p>
              Podemos atualizar estes Termos para refletir mudanças no produto ou na legislação.
              Alterações relevantes serão comunicadas por e-mail e/ou na própria plataforma, podendo
              exigir novo aceite. A versão vigente fica sempre disponível em <code>/termos</code> com a
              data de atualização.
            </p>
          </Bloco>

          <Bloco titulo="11. Lei aplicável e foro">
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o
              foro da Comarca de <strong>{CONTROLADOR.foro}</strong> para dirimir quaisquer controvérsias,
              com renúncia a qualquer outro, por mais privilegiado que seja.
            </p>
          </Bloco>

          <Bloco titulo="12. Contato">
            <p>
              Dúvidas, solicitações ou exercício de direitos: <a className="underline" href={`mailto:${CONTROLADOR.email}`}>{CONTROLADOR.email}</a>.
            </p>
          </Bloco>
        </section>

        <footer className="mt-12 pt-6 border-t text-xs text-muted-foreground">
          <p>
            Veja também a <Link className="underline" href="/privacidade">Política de Privacidade</Link>.
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
