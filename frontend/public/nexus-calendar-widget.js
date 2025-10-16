/**
 * Nexus Calendar Widget
 * Permite incorporar o calendário de agendamentos em sites externos
 *
 * Uso:
 * <div id="nexus-calendar-widget"></div>
 * <script>
 *   var nexusWidget = new NexusCalendarWidget({
 *     containerId: 'nexus-calendar-widget',
 *     apiKey: 'sua_api_key_aqui',
 *     tenantId: 'default',
 *     location: 'moema'
 *   });
 * </script>
 */

(function(window) {
  'use strict';

  const API_BASE = 'https://api.nexusatemporal.com.br/api/public/appointments';

  class NexusCalendarWidget {
    constructor(config) {
      this.config = {
        containerId: config.containerId || 'nexus-calendar-widget',
        apiKey: config.apiKey,
        tenantId: config.tenantId || 'default',
        location: config.location || 'moema',
        locale: config.locale || 'pt-BR',
        primaryColor: config.primaryColor || '#2563eb',
        ...config
      };

      this.container = document.getElementById(this.config.containerId);
      if (!this.container) {
        console.error(`Container #${this.config.containerId} não encontrado`);
        return;
      }

      this.selectedDate = null;
      this.selectedTime = null;
      this.availableSlots = [];

      this.init();
    }

    init() {
      this.injectStyles();
      this.render();
      this.loadInitialData();
    }

    injectStyles() {
      if (document.getElementById('nexus-widget-styles')) return;

      const style = document.createElement('style');
      style.id = 'nexus-widget-styles';
      style.innerHTML = `
        .nexus-widget {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .nexus-widget h2 {
          margin: 0 0 20px 0;
          color: #1f2937;
          font-size: 24px;
        }
        .nexus-widget-date-picker {
          margin-bottom: 20px;
        }
        .nexus-widget-date-picker label {
          display: block;
          margin-bottom: 8px;
          color: #374151;
          font-weight: 500;
        }
        .nexus-widget-date-picker input {
          width: 100%;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 16px;
        }
        .nexus-widget-time-slots {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 8px;
          margin: 20px 0;
        }
        .nexus-widget-time-slot {
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          text-align: center;
          cursor: pointer;
          background: white;
          transition: all 0.2s;
        }
        .nexus-widget-time-slot:hover:not(.disabled) {
          border-color: ${this.config.primaryColor};
          background: ${this.config.primaryColor}10;
        }
        .nexus-widget-time-slot.selected {
          background: ${this.config.primaryColor};
          color: white;
          border-color: ${this.config.primaryColor};
        }
        .nexus-widget-time-slot.disabled {
          background: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }
        .nexus-widget-form {
          margin-top: 20px;
        }
        .nexus-widget-form-group {
          margin-bottom: 16px;
        }
        .nexus-widget-form-group label {
          display: block;
          margin-bottom: 6px;
          color: #374151;
          font-weight: 500;
        }
        .nexus-widget-form-group input,
        .nexus-widget-form-group select,
        .nexus-widget-form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }
        .nexus-widget-button {
          width: 100%;
          padding: 12px;
          background: ${this.config.primaryColor};
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .nexus-widget-button:hover {
          opacity: 0.9;
        }
        .nexus-widget-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        .nexus-widget-loading {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }
        .nexus-widget-error {
          background: #fee2e2;
          color: #991b1b;
          padding: 12px;
          border-radius: 6px;
          margin: 12px 0;
        }
        .nexus-widget-success {
          background: #d1fae5;
          color: #065f46;
          padding: 12px;
          border-radius: 6px;
          margin: 12px 0;
        }
      `;
      document.head.appendChild(style);
    }

    render() {
      const today = new Date().toISOString().split('T')[0];

      this.container.innerHTML = `
        <div class="nexus-widget">
          <h2>Agendar Consulta</h2>

          <div class="nexus-widget-date-picker">
            <label>Escolha a Data</label>
            <input type="date" id="nexus-date-input" min="${today}" value="${today}">
          </div>

          <div id="nexus-time-slots-container">
            <div class="nexus-widget-loading">Carregando horários...</div>
          </div>

          <div id="nexus-booking-form" style="display: none;">
            <div class="nexus-widget-form">
              <div class="nexus-widget-form-group">
                <label>Nome Completo *</label>
                <input type="text" id="nexus-name" required>
              </div>
              <div class="nexus-widget-form-group">
                <label>Telefone *</label>
                <input type="tel" id="nexus-phone" required>
              </div>
              <div class="nexus-widget-form-group">
                <label>Email</label>
                <input type="email" id="nexus-email">
              </div>
              <div class="nexus-widget-form-group">
                <label>Observações</label>
                <textarea id="nexus-notes" rows="3"></textarea>
              </div>
              <button class="nexus-widget-button" id="nexus-submit-btn">
                Confirmar Agendamento
              </button>
            </div>
          </div>

          <div id="nexus-messages"></div>
        </div>
      `;

      this.attachEventListeners();
    }

    attachEventListeners() {
      const dateInput = document.getElementById('nexus-date-input');
      dateInput.addEventListener('change', (e) => {
        this.selectedDate = e.target.value;
        this.selectedTime = null;
        this.loadTimeSlots();
      });

      const submitBtn = document.getElementById('nexus-submit-btn');
      submitBtn.addEventListener('click', () => this.submitBooking());
    }

    async loadInitialData() {
      this.selectedDate = new Date().toISOString().split('T')[0];
      await this.loadTimeSlots();
    }

    async loadTimeSlots() {
      const container = document.getElementById('nexus-time-slots-container');
      container.innerHTML = '<div class="nexus-widget-loading">Carregando horários...</div>';

      try {
        const response = await fetch(
          `${API_BASE}/available-slots?date=${this.selectedDate}&location=${this.config.location}&tenantId=${this.config.tenantId}`
        );
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message);
        }

        this.availableSlots = data.data;
        this.renderTimeSlots();
      } catch (error) {
        container.innerHTML = `
          <div class="nexus-widget-error">
            Erro ao carregar horários disponíveis. Tente novamente.
          </div>
        `;
      }
    }

    renderTimeSlots() {
      const container = document.getElementById('nexus-time-slots-container');

      const availableOnly = this.availableSlots.filter(slot => slot.available);

      if (availableOnly.length === 0) {
        container.innerHTML = `
          <div class="nexus-widget-error">
            Não há horários disponíveis para esta data.
          </div>
        `;
        return;
      }

      const slotsHTML = availableOnly.map(slot => `
        <button
          class="nexus-widget-time-slot ${this.selectedTime === slot.time ? 'selected' : ''}"
          onclick="nexusWidgetInstance.selectTime('${slot.time}')"
        >
          ${slot.time}
        </button>
      `).join('');

      container.innerHTML = `
        <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">
          Escolha o Horário
        </label>
        <div class="nexus-widget-time-slots">
          ${slotsHTML}
        </div>
      `;
    }

    selectTime(time) {
      this.selectedTime = time;
      this.renderTimeSlots();
      document.getElementById('nexus-booking-form').style.display = 'block';
      document.getElementById('nexus-booking-form').scrollIntoView({ behavior: 'smooth' });
    }

    async submitBooking() {
      const name = document.getElementById('nexus-name').value.trim();
      const phone = document.getElementById('nexus-phone').value.trim();
      const email = document.getElementById('nexus-email').value.trim();
      const notes = document.getElementById('nexus-notes').value.trim();

      if (!name || !phone) {
        this.showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
      }

      if (!this.selectedDate || !this.selectedTime) {
        this.showMessage('Por favor, selecione data e horário.', 'error');
        return;
      }

      const submitBtn = document.getElementById('nexus-submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      try {
        // Primeiro, criar ou encontrar o lead
        const scheduledDateTime = `${this.selectedDate}T${this.selectedTime}:00`;

        const response = await fetch(`${API_BASE}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.config.apiKey
          },
          body: JSON.stringify({
            leadData: { name, phone, email },
            scheduledDate: scheduledDateTime,
            location: this.config.location,
            tenantId: this.config.tenantId,
            notes: notes || undefined
          })
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message);
        }

        this.showMessage('Agendamento realizado com sucesso! Entraremos em contato em breve.', 'success');

        // Limpar formulário
        document.getElementById('nexus-name').value = '';
        document.getElementById('nexus-phone').value = '';
        document.getElementById('nexus-email').value = '';
        document.getElementById('nexus-notes').value = '';
        document.getElementById('nexus-booking-form').style.display = 'none';

        this.selectedTime = null;
        this.loadTimeSlots();
      } catch (error) {
        this.showMessage(error.message || 'Erro ao criar agendamento. Tente novamente.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirmar Agendamento';
      }
    }

    showMessage(text, type) {
      const container = document.getElementById('nexus-messages');
      const className = type === 'error' ? 'nexus-widget-error' : 'nexus-widget-success';

      container.innerHTML = `<div class="${className}">${text}</div>`;

      container.scrollIntoView({ behavior: 'smooth' });

      setTimeout(() => {
        container.innerHTML = '';
      }, 5000);
    }
  }

  // Expor globalmente
  window.NexusCalendarWidget = NexusCalendarWidget;
  window.nexusWidgetInstance = null;

  // Auto-inicializar se houver configuração global
  if (window.NEXUS_WIDGET_CONFIG) {
    window.nexusWidgetInstance = new NexusCalendarWidget(window.NEXUS_WIDGET_CONFIG);
  }

})(window);
