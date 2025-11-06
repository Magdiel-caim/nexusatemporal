#!/usr/bin/env node

/**
 * Script para configurar CORS no bucket S3 (IDrive E2)
 * Permite que o frontend acesse imagens do S3
 */

const { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

console.log('🔧 Configurando CORS no bucket S3...\n');

// Configurar cliente S3
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
});

const BUCKET_NAME = process.env.S3_BUCKET || 'backupsistemaonenexus';

// Configuração CORS
const corsRules = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'HEAD'],
      AllowedOrigins: [
        'https://one.nexusatemporal.com.br',
        'http://localhost:5173', // Dev local
        'http://localhost:3000'  // Dev local alternativo
      ],
      ExposeHeaders: ['ETag', 'Content-Length', 'Content-Type'],
      MaxAgeSeconds: 3600
    }
  ]
};

async function configureCORS() {
  try {
    // 1. Verificar CORS atual
    console.log(`📋 Verificando CORS atual do bucket: ${BUCKET_NAME}...\n`);

    try {
      const getCorsCommand = new GetBucketCorsCommand({ Bucket: BUCKET_NAME });
      const currentCors = await s3Client.send(getCorsCommand);
      console.log('✅ CORS atual:');
      console.log(JSON.stringify(currentCors.CORSRules, null, 2));
      console.log('');
    } catch (error) {
      if (error.name === 'NoSuchCORSConfiguration') {
        console.log('⚠️  Nenhuma configuração CORS encontrada.\n');
      } else {
        throw error;
      }
    }

    // 2. Aplicar nova configuração CORS
    console.log('🔧 Aplicando nova configuração CORS...\n');
    console.log(JSON.stringify(corsRules, null, 2));
    console.log('');

    const putCorsCommand = new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: corsRules
    });

    await s3Client.send(putCorsCommand);

    console.log('✅ CORS configurado com sucesso!\n');

    // 3. Verificar configuração aplicada
    console.log('📋 Verificando configuração aplicada...\n');
    const verifyCommand = new GetBucketCorsCommand({ Bucket: BUCKET_NAME });
    const newCors = await s3Client.send(verifyCommand);
    console.log('✅ CORS configurado:');
    console.log(JSON.stringify(newCors.CORSRules, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('🎉 Configuração CORS concluída com sucesso!');
    console.log('');
    console.log('📝 Permissões configuradas:');
    console.log('   ✅ Métodos: GET, HEAD');
    console.log('   ✅ Origens permitidas:');
    console.log('      - https://one.nexusatemporal.com.br');
    console.log('      - http://localhost:5173 (dev)');
    console.log('      - http://localhost:3000 (dev)');
    console.log('   ✅ Headers expostos: ETag, Content-Length, Content-Type');
    console.log('   ✅ Cache: 1 hora (3600s)');
    console.log('');
    console.log('🧪 Próximo passo: Testar carregamento de imagens no frontend');

  } catch (error) {
    console.error('\n❌ Erro ao configurar CORS:', error.message);
    console.error('');
    console.error('Detalhes do erro:');
    console.error(error);
    process.exit(1);
  }
}

configureCORS()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
