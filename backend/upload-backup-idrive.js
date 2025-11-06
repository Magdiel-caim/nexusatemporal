const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const s3Client = new S3Client({
  endpoint: 'https://o0m5.va.idrivee2-26.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: '0o9zR3PqVlGmYqkqEhDI',
    secretAccessKey: 'wDBcCa4vtbuVWHn8kNb6Gv0Fq5uVvsFsUENJOJl4'
  }
});

async function uploadBackup() {
  const backupFile = 'backup-v128.1-20251104.tar.gz';
  const backupPath = path.join(__dirname, '..', backupFile);

  console.log('📦 Lendo arquivo de backup:', backupPath);
  const fileBuffer = fs.readFileSync(backupPath);
  const fileSizeKB = (fileBuffer.length / 1024).toFixed(2);
  console.log(`📊 Tamanho: ${fileSizeKB} KB`);

  const uploadParams = {
    Bucket: 'backupsistemaonenexus',
    Key: `backups/v128.1/${backupFile}`,
    Body: fileBuffer,
    ContentType: 'application/gzip',
    Metadata: {
      version: 'v128.1',
      date: '2025-11-04',
      description: 'Melhorias-Agenda-Confirmacao-Modal-Busca-Pacientes',
      size: fileSizeKB.toString()
    }
  };

  console.log('☁️  Enviando para iDrive E2...');

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    console.log('✅ Backup enviado com sucesso para iDrive E2!');
    console.log(`📍 Localização: backups/v128.1/${backupFile}`);
    console.log(`🔗 URL: https://o0m5.va.idrivee2-26.com/backupsistemaonenexus/backups/v128.1/${backupFile}`);
  } catch (error) {
    console.error('❌ Erro ao enviar backup:', error.message);
    process.exit(1);
  }
}

uploadBackup();
