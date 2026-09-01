# NOTA-PARA-FRONTEND.md — Data real do agendamento já existe na API

## Contexto

Foi reportado que, ao olhar um agendamento (cortesia ou avaliação física/nutricional), só aparece
o dia da semana (`"Segunda"`, `"Terça"`...) e não dá pra saber a data exata. Investigamos do lado
do backend e **o dado já existe e já está correto na API** — o problema não é falta de informação,
é que ela não está sendo exibida (ou o formulário público não deixa claro qual data foi resolvida
antes de enviar).

Confirmado com dados reais de produção (`GET /cortesia`, hoje):

```json
{ "nome": "Silvio Pereira Batista", "dia": "Sexta", "datasAula": "24/07/2026", ... }
{ "nome": "Andressa de Cassia Cunha Rosario", "dia": "Terça", "datasAula": "21/07/2026", ... }
```

Ou seja: quando o cliente marca "Sexta", o próprio frontend (no momento do agendamento) já calcula
e envia qual sexta-feira exata é, no campo `datasAula`/`data`. O backend só grava e devolve esse
valor — não recalcula nada.

## Campos com a data real, por recurso

| Recurso                  | Campo com o dia da semana | Campo com a data real (`dd/mm/aaaa`) |
| ------------------------- | -------------------------- | -------------------------------------- |
| `cortesia`                | `dia`                       | `datasAula` — mesma cardinalidade de `dia` (no Cross Training pode ser uma lista de dias e datas, ex: `dia: "Segunda, Terça"`, `datasAula: "21/07/2026, 22/07/2026"`) |
| `avaliacao-fisica`        | `dia`                       | `data`                                  |
| `avaliacao-nutricional`   | `dia`                       | `data`                                  |
| `matricula`                | —                           | não se aplica (matrícula é adesão a plano, não uma aula com data marcada) |

Esses campos já vêm em **todos** os lugares onde o registro aparece:
- No `POST` de criação (o frontend já manda esse campo — é assim que ele chega até nós).
- No `GET` administrativo (`GET /cortesia`, `GET /avaliacao-fisica`, `GET /avaliacao-nutricional`),
  junto com `id`, `createdAt` e o resto dos campos do contrato.

## O que precisa mudar (do lado do frontend)

1. **Painel administrativo**: nas telas que listam cortesias / avaliações físicas / avaliações
   nutricionais, exibir `datasAula`/`data` junto (ou no lugar) de `dia` — hoje aparentemente só
   `dia` está sendo renderizado, mesmo a API já devolvendo a data completa.
2. **Formulário público de agendamento**: se hoje o cliente só vê botões de dia da semana
   (`"Segunda", "Terça"...`) sem nenhuma indicação da data real que o sistema vai resolver, vale
   mostrar essa data calculada na tela antes de confirmar o envio (ex: "Segunda-feira, 21/07") —
   pra ninguém agendar sem saber exatamente qual dia está marcando.

Nenhuma mudança de contrato de API é necessária — os campos já existem e já estão corretos. É só
questão de exibição no frontend.
