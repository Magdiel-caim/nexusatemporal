/**
 * Script para resetar a senha do usuário Daniel
 */

import { CrmDataSource } from '../src/database/data-source';
import { User } from '../src/modules/auth/user.entity';
import * as bcrypt from 'bcryptjs';

async function resetDanielPassword() {
  try {
    // Inicializar conexão
    if (!CrmDataSource.isInitialized) {
      await CrmDataSource.initialize();
    }

    const userRepository = CrmDataSource.getRepository(User);

    // Buscar usuário Daniel
    const user = await userRepository.findOne({
      where: { email: 'daniel@clinicaempireexcellence.com.br' }
    });

    if (!user) {
      console.log('❌ Usuário Daniel não encontrado!');
      process.exit(1);
    }

    console.log(`👤 Usuário encontrado: ${user.name} (${user.email})`);
    console.log(`📧 Email verificado: ${user.emailVerified}`);
    console.log(`📊 Status: ${user.status}`);
    console.log(`👑 Role: ${user.role}`);
    console.log(`🏢 Tenant: ${user.tenantId}`);

    // Nova senha
    const newPassword = 'Daniel@2024!Nexus';

    // Hash da senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar usuário
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.updatedAt = new Date();

    await userRepository.save(user);

    console.log('\n✅ Senha resetada com sucesso!');
    console.log('\n📋 Credenciais de acesso:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email: ${user.email}`);
    console.log(`Senha: ${newPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌐 URL de acesso: https://one.nexusatemporal.com.br');
    console.log('\n⚠️  IMPORTANTE: Informe ao usuário para alterar a senha após o primeiro login!');

    process.exit(0);

  } catch (error: any) {
    console.error('❌ Erro ao resetar senha:', error.message);
    process.exit(1);
  }
}

// Executar
resetDanielPassword();
