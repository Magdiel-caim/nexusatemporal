# Widget de Agendamento Nexus CRM

## Instalação Rápida

Adicione o widget ao seu site em 3 passos simples:

### Passo 1: Inclua o Script

Adicione esta linha no `<head>` ou antes de fechar o `</body>` do seu site:

```html
<script src="https://nexusatemporal.com.br/nexus-calendar-widget.js"></script>
```

### Passo 2: Crie o Container

Adicione um elemento onde o widget será renderizado:

```html
<div id="nexus-calendar-widget"></div>
```

### Passo 3: Inicialize o Widget

Adicione o script de inicialização logo após o container:

```html
<script>
  var nexusWidget = new NexusCalendarWidget({
    containerId: 'nexus-calendar-widget',
    apiKey: 'nexus_sua_chave_aqui',
    tenantId: 'default',
    location: 'moema'
  });
</script>
```

---

## Exemplo Completo

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agendamento Online</title>
</head>
<body>
  <h1>Agende sua Consulta</h1>

  <!-- Container do Widget -->
  <div id="nexus-calendar-widget"></div>

  <!-- Script do Widget -->
  <script src="https://nexusatemporal.com.br/nexus-calendar-widget.js"></script>

  <!-- Inicialização -->
  <script>
    window.nexusWidgetInstance = new NexusCalendarWidget({
      containerId: 'nexus-calendar-widget',
      apiKey: 'nexus_sua_chave_aqui',
      tenantId: 'default',
      location: 'moema',
      primaryColor: '#2563eb'
    });
  </script>
</body>
</html>
```

---

## Opções de Configuração

| Opção | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| `containerId` | string | Não | 'nexus-calendar-widget' | ID do elemento container |
| `apiKey` | string | Sim | - | Sua chave de API |
| `tenantId` | string | Não | 'default' | ID do tenant |
| `location` | string | Não | 'moema' | Local padrão (moema, av_paulista, perdizes, online, a_domicilio) |
| `locale` | string | Não | 'pt-BR' | Idioma (pt-BR, en-US) |
| `primaryColor` | string | Não | '#2563eb' | Cor primária do widget (hexadecimal) |

---

## Customização Visual

### Mudando a Cor Primária

```javascript
new NexusCalendarWidget({
  containerId: 'nexus-calendar-widget',
  apiKey: 'sua_chave',
  primaryColor: '#10b981' // Verde
});
```

### CSS Personalizado

Você pode sobrescrever os estilos do widget adicionando CSS personalizado:

```css
.nexus-widget {
  max-width: 800px !important;
  border: 2px solid #e5e7eb;
}

.nexus-widget h2 {
  color: #059669 !important;
  font-size: 28px !important;
}

.nexus-widget-button {
  background: linear-gradient(90deg, #10b981, #059669) !important;
}
```

---

## Locais Disponíveis

- `moema` - Moema
- `av_paulista` - Av. Paulista
- `perdizes` - Perdizes
- `online` - Online
- `a_domicilio` - A Domicílio

---

## Inicialização Alternativa

### Usando Configuração Global

```html
<script>
  // Defina a configuração antes de carregar o script
  window.NEXUS_WIDGET_CONFIG = {
    containerId: 'nexus-calendar-widget',
    apiKey: 'nexus_sua_chave_aqui',
    tenantId: 'default',
    location: 'moema'
  };
</script>
<script src="https://nexusatemporal.com.br/nexus-calendar-widget.js"></script>
```

O widget será inicializado automaticamente.

---

## Múltiplos Widgets na Mesma Página

Você pode ter múltiplos widgets para diferentes locais:

```html
<!-- Widget 1 - Moema -->
<div id="widget-moema"></div>
<script>
  new NexusCalendarWidget({
    containerId: 'widget-moema',
    apiKey: 'sua_chave',
    location: 'moema'
  });
</script>

<!-- Widget 2 - Av. Paulista -->
<div id="widget-paulista"></div>
<script>
  new NexusCalendarWidget({
    containerId: 'widget-paulista',
    apiKey: 'sua_chave',
    location: 'av_paulista'
  });
</script>
```

---

## Integração com WordPress

### Usando Código HTML Personalizado

1. Instale o plugin "Insert Headers and Footers" ou similar
2. Adicione o script do widget no header:

```html
<script src="https://nexusatemporal.com.br/nexus-calendar-widget.js"></script>
```

3. Em qualquer página/post, adicione um bloco de HTML personalizado:

```html
<div id="nexus-calendar-widget"></div>
<script>
  new NexusCalendarWidget({
    containerId: 'nexus-calendar-widget',
    apiKey: 'nexus_sua_chave_aqui',
    location: 'moema'
  });
</script>
```

### Usando Shortcode (Requer Plugin)

Se você possui um plugin de shortcodes personalizado, pode criar:

```php
function nexus_calendar_shortcode($atts) {
    $atts = shortcode_atts(array(
        'location' => 'moema',
        'apikey' => '',
    ), $atts);

    return '<div id="nexus-calendar-widget"></div>
            <script>
                new NexusCalendarWidget({
                    containerId: "nexus-calendar-widget",
                    apiKey: "' . esc_js($atts['apikey']) . '",
                    location: "' . esc_js($atts['location']) . '"
                });
            </script>';
}
add_shortcode('nexus_calendar', 'nexus_calendar_shortcode');
```

Uso: `[nexus_calendar location="moema" apikey="sua_chave"]`

---

## Eventos JavaScript

### Callbacks Personalizados

```javascript
var widget = new NexusCalendarWidget({
  containerId: 'nexus-calendar-widget',
  apiKey: 'sua_chave',

  // Callback quando um agendamento é criado
  onBookingSuccess: function(data) {
    console.log('Agendamento criado:', data);
    // Enviar para Google Analytics, etc
    gtag('event', 'appointment_created', {
      location: data.location,
      date: data.scheduledDate
    });
  },

  // Callback quando ocorre um erro
  onBookingError: function(error) {
    console.error('Erro no agendamento:', error);
    // Notificar sistema de monitoramento
  }
});
```

---

## Requisitos

- **Navegadores suportados:** Chrome, Firefox, Safari, Edge (últimas 2 versões)
- **JavaScript:** Deve estar habilitado
- **API Key:** Obrigatória para criar agendamentos

---

## Segurança

- A API Key deve ser mantida em segredo
- Use HTTPS no seu site para proteger os dados dos usuários
- O widget valida todos os dados antes de enviar

---

## Troubleshooting

### Widget não aparece

1. Verifique se o script está sendo carregado (Console do navegador)
2. Confirme que o container existe com o ID correto
3. Verifique erros no console do navegador

### Erro "API key inválida"

1. Verifique se a API key está correta
2. Confirme que a chave não expirou
3. Entre em contato com o suporte

### Horários não aparecem

1. Verifique se a data selecionada é futura
2. Confirme o `location` configurado
3. Verifique se há disponibilidade na agenda

---

## Suporte

- **Email:** ti.nexus@nexusatemporal.com.br
- **Documentação da API:** Ver `PUBLIC_API_DOCUMENTATION.md`
- **Demos:** https://demo.nexusatemporal.com.br/widget

---

## Changelog

### v1.0.0 (2025-10-16)
- Lançamento inicial
- Suporte a múltiplos locais
- Customização de cores
- Validação de formulário
- Integração com API pública
