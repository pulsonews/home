import type { Artigo } from "./db";

export type ProvedorIA = "claude" | "gemini";

const CLAUDE_MODEL = "claude-sonnet-4-6";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const SYSTEM_PROMPT = `Você é um jornalista da redação do "Pulso Notícias", um portal brasileiro de notícias.

Sua tarefa é escrever uma matéria ORIGINAL e AUTORAL a partir do resumo de uma notícia de outra fonte, que será fornecido pelo usuário.

REGRAS OBRIGATÓRIAS:
1. NUNCA invente fatos, dados, declarações ou citações que não estejam no resumo fornecido. Se o resumo não tiver um detalhe, não invente — seja mais genérico nesse ponto.
2. NUNCA copie frases ou trechos literais do resumo original. Reescreva tudo com suas próprias palavras e estrutura de texto.
3. Adicione contexto, explicação e análise que ajudem o leitor a entender a notícia (histórico do tema, o que pode vir a seguir, por que aquilo importa) — mas deixe claro quando algo é interpretação/contexto e quando é fato relatado.
4. Não tome partido político nem faça juízo de valor sobre pessoas ou grupos. Mantenha tom jornalístico neutro.
5. Sempre mencione, no corpo do texto, que a apuração original é de [nome da fonte], de forma natural (ex: "Segundo apuração do [fonte]...").
6. Se o resumo fornecido for curto ou vago demais para sustentar uma matéria completa e precisa, escreva um texto mais curto mas ainda assim inteiramente factual — nunca preencha lacunas com invenção.

FORMATO DA RESPOSTA:
Responda SOMENTE com um JSON válido, sem markdown, sem texto antes ou depois, no formato exato:
{"titulo": "...", "resumo": "...", "corpo": ["parágrafo 1", "parágrafo 2", "..."]}

- "titulo": manchete original (não copie o título da fonte).
- "resumo": 1-2 frases, para uso como linha de apoio/chamada.
- "corpo": array de parágrafos (strings) em português, sem tags HTML.`;

type Resultado = { titulo: string; resumo: string; corpo: string[] };

function montarPromptUsuario(artigo: Artigo) {
  return `Fonte: ${artigo.fonte}
Título original: ${artigo.titulo}
Resumo/apuração disponível: ${artigo.resumo}
Categoria: ${artigo.categoria}

Escreva a matéria autoral seguindo as regras do sistema.`;
}

function extrairJSON(texto: string): Resultado {
  let parsed: Resultado;
  try {
    const clean = texto.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    throw new Error("Não foi possível interpretar a resposta da IA como JSON válido.");
  }
  if (!parsed.titulo || !parsed.resumo || !Array.isArray(parsed.corpo)) {
    throw new Error("Resposta da IA incompleta (faltou título, resumo ou corpo).");
  }
  return parsed;
}

async function gerarComClaude(artigo: Artigo): Promise<Resultado> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY não configurada. Crie uma chave em platform.anthropic.com e adicione essa variável de ambiente."
    );
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: montarPromptUsuario(artigo) }]
    })
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Erro na API da Anthropic (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((b: any) => b.type === "text");
  if (!textBlock?.text) throw new Error("Resposta da IA sem conteúdo de texto.");
  return extrairJSON(textBlock.text);
}

async function gerarComGemini(artigo: Artigo): Promise<Resultado> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY não configurada. Crie uma chave em aistudio.google.com/apikey e adicione essa variável de ambiente."
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: montarPromptUsuario(artigo) }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2000,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Erro na API do Gemini (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!texto) throw new Error("Resposta do Gemini sem conteúdo de texto.");
  return extrairJSON(texto);
}

/**
 * Gera uma matéria autoral usando o provedor de IA escolhido.
 * Ambos os provedores recebem exatamente o mesmo prompt/regras, garantindo
 * o mesmo padrão de precisão factual e originalidade.
 */
export async function gerarMateriaAutoral(
  artigo: Artigo,
  provedor: ProvedorIA = "claude"
): Promise<Resultado> {
  if (provedor === "gemini") return gerarComGemini(artigo);
  return gerarComClaude(artigo);
}
