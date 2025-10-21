import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Instagram, Linkedin, Youtube } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    produto: [
      { label: 'Recursos', href: '/#features' },
      { label: 'Planos e Preços', href: '/planos' },
      { label: 'Módulos', href: '/#modulos' },
      { label: 'Trial Grátis', href: '/planos' },
    ],
    empresa: [
      { label: 'Sobre nós', href: '/sobre' },
      { label: 'Blog', href: '/blog' },
      { label: 'Casos de Sucesso', href: '/casos-sucesso' },
      { label: 'Carreiras', href: '/carreiras' },
    ],
    suporte: [
      { label: 'Central de Ajuda', href: '/ajuda' },
      { label: 'Documentação', href: '/docs' },
      { label: 'FAQ', href: '/#faq' },
      { label: 'Contato', href: '/contato' },
    ],
    legal: [
      { label: 'Termos de Uso', href: '/termos' },
      { label: 'Privacidade', href: '/privacidade' },
      { label: 'Segurança', href: '/seguranca' },
      { label: 'LGPD', href: '/lgpd' },
    ],
  };

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo e Descrição */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logos/Logo - Nexus Atemporal 3.png"
                alt="Nexus Atemporal"
                width={180}
                height={50}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
              O CRM mais completo para clínicas de estética. Gestão, automação e IA em um só lugar.
            </p>

            {/* Contato */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <a href="mailto:contato@nexustemporal.com.br" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  contato@nexustemporal.com.br
                </a>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <a href="tel:+5511999999999" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  (11) 99999-9999
                </a>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>São Paulo, Brasil</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Produto</h3>
            <ul className="space-y-3">
              {links.produto.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Empresa</h3>
            <ul className="space-y-3">
              {links.empresa.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Suporte</h3>
            <ul className="space-y-3">
              {links.suporte.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Redes Sociais e Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} Nexus Atemporal. Todos os direitos reservados.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a
              href="https://instagram.com/nexusatemporal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com/company/nexusatemporal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://youtube.com/@nexusatemporal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
