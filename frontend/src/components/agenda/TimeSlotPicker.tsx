import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: {
    id: string;
    patientName: string;
  };
}

interface TimeSlotPickerProps {
  selectedDate: string;
  selectedTime: string;
  occupiedSlots: string[]; // Array de horários ocupados ['09:00', '10:30', etc]
  onTimeSelect: (time: string) => void;
  startHour?: number;
  endHour?: number;
  interval?: number; // Intervalo em minutos (padrão 5)
  location?: string;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedDate,
  selectedTime,
  occupiedSlots = [],
  onTimeSelect,
  startHour = 7,
  endHour = 20,
  interval = 5,
  location,
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    generateTimeSlots();
  }, [selectedDate, occupiedSlots, startHour, endHour, interval]);

  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    const totalMinutes = (endHour - startHour) * 60;
    const numberOfSlots = Math.floor(totalMinutes / interval);

    for (let i = 0; i <= numberOfSlots; i++) {
      const totalMinutesFromStart = startHour * 60 + i * interval;
      const hours = Math.floor(totalMinutesFromStart / 60);
      const minutes = totalMinutesFromStart % 60;

      // Parar se ultrapassar o horário final
      if (hours >= endHour && minutes > 0) break;
      if (hours > endHour) break;

      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      const isOccupied = occupiedSlots.includes(timeString);
      const isPast = isPastTime(selectedDate, timeString);

      slots.push({
        time: timeString,
        available: !isOccupied && !isPast,
      });
    }

    setTimeSlots(slots);
  };

  const isPastTime = (date: string, time: string): boolean => {
    if (!date) return false;

    const [hours, minutes] = time.split(':').map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes, 0, 0);

    const now = new Date();

    return slotDate < now;
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.available) {
      return;
    }
    onTimeSelect(slot.time);
  };

  const getSlotClassName = (slot: TimeSlot) => {
    const baseClass = 'px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all cursor-pointer text-center';

    if (!slot.available) {
      return `${baseClass} bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed opacity-50`;
    }

    if (slot.time === selectedTime) {
      return `${baseClass} bg-blue-600 text-white border-blue-600 shadow-md`;
    }

    return `${baseClass} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20`;
  };

  const getTimeOfDay = (time: string): string => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'Manhã';
    if (hour < 18) return 'Tarde';
    return 'Noite';
  };

  // Agrupar slots por período do dia
  const groupedSlots = timeSlots.reduce((acc, slot) => {
    const period = getTimeOfDay(slot.time);
    if (!acc[period]) {
      acc[period] = [];
    }
    acc[period].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const periods = ['Manhã', 'Tarde', 'Noite'];

  if (!selectedDate) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
        <div className="text-center">
          <Clock className="mx-auto mb-2 text-gray-400 dark:text-gray-600" size={32} />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Selecione uma data para ver os horários disponíveis
          </p>
        </div>
      </div>
    );
  }

  const availableCount = timeSlots.filter(s => s.available).length;
  const occupiedCount = timeSlots.filter(s => !s.available).length;

  return (
    <div className="space-y-4">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Horários para {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}
          </h3>
          {location && (
            <p className="text-sm text-gray-600 dark:text-gray-400">Local: {location}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-green-600 dark:text-green-400">{availableCount}</span> disponíveis
            {' • '}
            <span className="font-semibold text-red-600 dark:text-red-400">{occupiedCount}</span> ocupados
          </p>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 px-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded"></div>
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 border-2 border-blue-600 rounded"></div>
          <span>Selecionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded opacity-50"></div>
          <span>Ocupado</span>
        </div>
      </div>

      {/* Grade de horários por período */}
      {periods.map((period) => {
        const slots = groupedSlots[period] || [];
        if (slots.length === 0) return null;

        return (
          <div key={period} className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2">
              {period}
            </h4>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => handleSlotClick(slot)}
                  disabled={!slot.available}
                  className={getSlotClassName(slot)}
                  title={slot.available ? 'Horário disponível' : 'Horário ocupado'}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Aviso se nenhum horário disponível */}
      {availableCount === 0 && (
        <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              Nenhum horário disponível nesta data
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
              Todos os horários já estão ocupados ou já passaram. Por favor, selecione outra data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;
