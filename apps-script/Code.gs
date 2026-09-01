/**
 * Academia Belfort — recebe os POSTs do backend NestJS (rotas /cortesia, /matricula,
 * /avaliacao-fisica, /avaliacao-nutricional e /admin/banners) e grava cada um numa aba diferente
 * desta planilha. Também expõe uma leitura (doGet) protegida por segredo, usada pelo backend para
 * checar duplicidade de CPF, montar os lembretes de aula por e-mail e alimentar a área
 * administrativa. Banners guardam só metadados aqui — a imagem em si fica no Cloudinary.
 * Suporta também update por id (confirmar presença, ou atualizar campos genéricos) e exclusão por
 * id — exclusão é soft-delete: a linha é esvaziada e o conteúdo original vai pra aba "Excluídos"
 * como backup.
 *
 * Como implantar:
 * 1. Crie uma planilha nova no Google Sheets.
 * 2. Extensões → Apps Script.
 * 3. Apague o conteúdo padrão e cole este arquivo inteiro.
 * 4. Troque SHARED_SECRET abaixo por um valor aleatório seu.
 * 5. Salve, depois Implantar → Nova implantação → tipo "App da Web".
 *    Executar como: Eu. Quem pode acessar: Qualquer pessoa.
 * 6. Autorize as permissões pedidas (é a sua própria planilha).
 * 7. Copie a URL do App da Web e cole em backend/.env, nas variáveis:
 *    APPS_SCRIPT_URL_CORTESIA, APPS_SCRIPT_URL_MATRICULA, APPS_SCRIPT_URL_AVALIACAO,
 *    APPS_SCRIPT_URL_AVALIACAO_NUTRICIONAL e APPS_SCRIPT_URL_BANNERS (é a mesma URL pras cinco).
 * 8. Cole o mesmo valor de SHARED_SECRET em backend/.env, na variável APPS_SCRIPT_SHARED_SECRET.
 *
 * Se editar este arquivo depois de já ter implantado uma vez, é preciso reimplantar:
 * Implantar → Gerenciar implantações → ícone de lápis → Versão: "Nova versão" → Implantar.
 * A URL continua a mesma, não precisa trocar no backend.
 *
 * Importante: cada valor é gravado com um apóstrofo (') na frente, que é a forma padrão do
 * Sheets de forçar "isso é texto puro, não tente adivinhar que é hora/data/número". Sem
 * isso, valores como "07:00" ou "20/07/2026" viram data/hora sozinhos e voltam tortos na
 * leitura. O apóstrofo não aparece no valor lido de volta (é só um marcador de entrada).
 */

var SHARED_SECRET = 'TROQUE_ESTE_SEGREDO';
var CODE_VERSION = 'v12-matricula-numero';
var EXCLUIDOS_SHEET = 'Excluídos';
var EXCLUIDOS_HEADERS = ['origem', 'excluidoEm', 'dadosOriginais'];

// Importante: pra planilhas que já estão em produção (todas, exceto Excluídos), qualquer
// coluna nova precisa ser adicionada SEMPRE no final do array de headers, nunca no meio.
// doPost/doGet leem e escrevem por posição (índice do array = coluna física da planilha) — a
// aba já existente tem a linha 1 (cabeçalho) e as colunas de dados fixas na ordem antiga, então
// inserir uma coluna no meio desalinharia todos os dados já gravados. Ao adicionar uma coluna
// no final, dá pra digitar o nome dela manualmente na célula do cabeçalho (linha 1) da aba já
// existente — isso é só cosmético, a leitura/escrita funciona por posição independente do texto
// que estiver na célula do cabeçalho.
var CORTESIA_HEADERS = [
  'timestamp', 'nome', 'whatsapp', 'email', 'cpf', 'modalidade', 'horario', 'dia', 'datasAula', 'limitacao',
  'presencaConfirmada', 'unidade', 'observacao',
];

var MATRICULA_HEADERS = [
  'timestamp', 'nome', 'nascimento', 'email', 'cpf', 'endereco', 'whatsapp',
  'instagram', 'limitacao', 'modalidade', 'unidade', 'horario', 'cref', 'plano', 'aceite', 'observacao',
  'numeroMatricula',
];

var AVALIACAO_HEADERS = [
  'timestamp', 'nome', 'whatsapp', 'unidade', 'dia', 'data', 'horario', 'valor', 'observacao',
];

var BANNERS_HEADERS = [
  'timestamp', 'imageUrl', 'cloudinaryPublicId', 'ordem', 'ativo', 'link', 'alt',
];

var TIPOS = {
  matricula: { sheet: 'Matrícula', headers: MATRICULA_HEADERS },
  cortesia: { sheet: 'Cortesia', headers: CORTESIA_HEADERS },
  'avaliacao-fisica': { sheet: 'Avaliação Física', headers: AVALIACAO_HEADERS },
  // Mesmo formato de campos da avaliação física, só muda a aba (e o valor, que já vem no payload).
  'avaliacao-nutricional': { sheet: 'Avaliação Nutricional', headers: AVALIACAO_HEADERS },
  banners: { sheet: 'Banners', headers: BANNERS_HEADERS },
};

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.getDataAsString('UTF-8'));

    if (data.acao === 'confirmar-presenca') {
      return atualizarPresencaCortesia(data);
    }
    if (data.acao === 'excluir') {
      return excluirRegistro(data);
    }
    if (data.acao === 'atualizar-campos') {
      return atualizarCampos(data);
    }

    var tipo = TIPOS[data.tipo];
    if (!tipo) {
      return jsonResponse({ success: false, error: 'tipo desconhecido: ' + data.tipo });
    }

    var sheet = getOrCreateSheet(tipo.sheet, tipo.headers);
    var row = tipo.headers.map(function (key) {
      var value = data[key] !== undefined ? String(data[key]) : '';
      return "'" + value;
    });
    sheet.appendRow(row);

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: String(err) });
  }
}

// data.id é o número da linha na planilha (mesmo valor devolvido como "id" pelo doGet),
// não um índice de array — vem direto do backend, que calcula id = índice + 2.
function atualizarPresencaCortesia(data) {
  var rowNumber = parseInt(data.id, 10);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TIPOS.cortesia.sheet);

  if (!rowNumber || rowNumber < 2 || !sheet || rowNumber > sheet.getLastRow()) {
    return jsonResponse({ success: false, error: 'not_found' });
  }

  var colIndex = TIPOS.cortesia.headers.indexOf('presencaConfirmada') + 1;
  sheet.getRange(rowNumber, colIndex).setValue("'" + (data.confirmada ? 'true' : 'false'));

  return jsonResponse({ success: true });
}

// Update genérico por id: recebe data.tipo, data.id e data.campos (objeto { coluna: valor }),
// e escreve só as colunas presentes em data.campos que existirem em tipo.headers. Diferente de
// atualizarPresencaCortesia (que é fixo numa coluna só), serve pra qualquer recurso que precise
// atualizar um subconjunto de campos por id — hoje usado só pelo PATCH /admin/banners/:id.
function atualizarCampos(data) {
  var tipo = TIPOS[data.tipo];
  if (!tipo) {
    return jsonResponse({ success: false, error: 'tipo desconhecido: ' + data.tipo });
  }

  var rowNumber = parseInt(data.id, 10);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tipo.sheet);
  if (!rowNumber || rowNumber < 2 || !sheet || rowNumber > sheet.getLastRow()) {
    return jsonResponse({ success: false, error: 'not_found' });
  }

  var campos = data.campos || {};
  Object.keys(campos).forEach(function (key) {
    var colIndex = tipo.headers.indexOf(key) + 1;
    if (colIndex > 0) {
      sheet.getRange(rowNumber, colIndex).setValue("'" + String(campos[key]));
    }
  });

  return jsonResponse({ success: true });
}

// Não usa sheet.deleteRow() de propósito: apagar a linha de verdade deslocaria o número de
// todas as linhas abaixo, e esse número é o "id" que o backend usa pra localizar registros
// (inclusive pra confirmar presença). Em vez disso, a linha é esvaziada (o backend já trata
// timestamp vazio como "registro apagado" e filtra da listagem) e o conteúdo original vai
// pra aba "Excluídos", como backup recuperável manualmente.
function excluirRegistro(data) {
  var tipo = TIPOS[data.tipo];
  if (!tipo) {
    return jsonResponse({ success: false, error: 'tipo desconhecido: ' + data.tipo });
  }

  var rowNumber = parseInt(data.id, 10);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tipo.sheet);
  if (!rowNumber || rowNumber < 2 || !sheet || rowNumber > sheet.getLastRow()) {
    return jsonResponse({ success: false, error: 'not_found' });
  }

  var range = sheet.getRange(rowNumber, 1, 1, tipo.headers.length);
  var values = range.getValues()[0];
  if (values[0] === '') {
    // já estava vazia (apagada antes, ou linha nunca preenchida)
    return jsonResponse({ success: false, error: 'not_found' });
  }

  var obj = {};
  tipo.headers.forEach(function (key, i) {
    obj[key] = values[i];
  });

  var excluidos = getOrCreateSheet(EXCLUIDOS_SHEET, EXCLUIDOS_HEADERS);
  excluidos.appendRow([
    "'" + tipo.sheet,
    "'" + new Date().toLocaleString('pt-BR', { timeZone: 'America/Belem' }),
    "'" + JSON.stringify(obj),
  ]);

  range.clearContent();

  return jsonResponse({ success: true });
}

function doGet(e) {
  if (!e.parameter.secret || e.parameter.secret !== SHARED_SECRET) {
    return jsonResponse({ success: false, error: 'unauthorized' });
  }

  var tipo = TIPOS[e.parameter.tipo];
  if (!tipo) {
    return jsonResponse({ success: false, error: 'tipo desconhecido: ' + e.parameter.tipo });
  }
  var sheetName = tipo.sheet;
  var headers = tipo.headers;

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) {
    return jsonResponse({ success: true, rows: [], version: CODE_VERSION });
  }

  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  var rows = values.map(function (row) {
    var obj = {};
    headers.forEach(function (key, i) {
      obj[key] = row[i];
    });
    return obj;
  });

  return jsonResponse({ success: true, rows: rows, version: CODE_VERSION });
}

function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Trava as colunas (cabeçalho + 2000 linhas futuras) como texto puro, senão o Sheets
    // converte sozinho valores que parecem hora/data/número (ex: "07:00", "20/07/2026").
    sheet.getRange(1, 1, 2001, headers.length).setNumberFormat('@');
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
