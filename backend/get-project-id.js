#!/usr/bin/env node

const Airtable = require('airtable');

const API_KEY = 'patu1m6kINW6QAj8Q.20e854be4162d9eb37cd09b506d2ef188342fb5156f50ef13d8193d613427d92';
const BASE_ID = 'app9Xi4DQ8KiQw4x6';

Airtable.configure({ apiKey: API_KEY });
const base = Airtable.base(BASE_ID);

base('Projects').select({
  filterByFormula: `{Project Name} = "Modulo Chat One Nexus"`,
  maxRecords: 1
}).firstPage((err, records) => {
  if (err) {
    console.error(err);
    return;
  }
  if (records.length > 0) {
    console.log('ID do Projeto:', records[0].id);
  } else {
    console.log('Projeto não encontrado');
  }
});
