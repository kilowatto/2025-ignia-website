// ============================================================================
// BOOKING CALENDAR - React Island Component
// ============================================================================
//
// PROPÓSITO:
// Componente interactivo para seleccionar fecha y hora para reuniones.
// Integrado con Odoo calendar.event via API GET /api/booking/slots.
//
// PHASE: 1.3 - Frontend UI (Read-only, sin formulario aún)
//
// FEATURES:
// - Date picker con calendario visual
// - Grid de slots disponibles por día
// - Loading states (skeleton)
// - Empty states (sin disponibilidad)
// - Timezone display
// - Responsive (mobile-first)
//
// ARQUITECTURA:
// - React Island (solo este componente es interactivo)
// - Tailwind CSS para estilos
// - Fetch API para llamadas al backend
// - TypeScript strict
//
// USO:
// <BookingCalendar client:load locale="es" />
//
// @see src/pages/api/booking/slots.ts - API endpoint
// @see src/lib/odoo/types.ts - Tipos de TimeSlot
// ============================================================================

import { useState, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  date: string;
  reason?: 'occupied' | 'outside_hours' | 'buffer' | 'past';
}

interface SlotsResponse {
  success: boolean;
  date: string;
  slots: TimeSlot[];
  metadata: {
    timezone: string;
    businessHours: { start: string; end: string } | null;
    totalSlots: number;
    availableSlots: number;
    occupiedSlots: number;
    duration: number;
  };
  error?: string;
  message?: string;
}

interface BookingCalendarProps {
  /** Idioma del componente (en/es/fr) */
  locale?: 'en' | 'es' | 'fr';
  
  /** Duración de reunión en minutos (default: 30) */
  duration?: number;
  
  /** Callback cuando se selecciona un slot (Phase 2) */
  onSlotSelect?: (slot: TimeSlot) => void;
}

// ============================================================================
// TRANSLATIONS
// ============================================================================

const translations = {
  en: {
    title: 'Schedule a Meeting',
    subtitle: 'Select a date and time for your meeting',
    selectDate: 'Select Date',
    availableSlots: 'Available Time Slots',
    noSlotsTitle: 'No availability',
    noSlotsMessage: 'No time slots available for this date. Please try another day.',
    loadingSlots: 'Loading available slots...',
    errorTitle: 'Error loading slots',
    errorMessage: 'Could not load available time slots. Please try again.',
    timezone: 'Timezone',
    duration: 'Duration',
    minutes: 'minutes',
    available: 'Available',
    occupied: 'Occupied',
    selectSlot: 'Select this time',
    retry: 'Retry',
  },
  es: {
    title: 'Agendar una Reunión',
    subtitle: 'Selecciona una fecha y hora para tu reunión',
    selectDate: 'Seleccionar Fecha',
    availableSlots: 'Horarios Disponibles',
    noSlotsTitle: 'Sin disponibilidad',
    noSlotsMessage: 'No hay horarios disponibles para esta fecha. Por favor intenta otro día.',
    loadingSlots: 'Cargando horarios disponibles...',
    errorTitle: 'Error al cargar horarios',
    errorMessage: 'No se pudieron cargar los horarios disponibles. Por favor intenta de nuevo.',
    timezone: 'Zona horaria',
    duration: 'Duración',
    minutes: 'minutos',
    available: 'Disponible',
    occupied: 'Ocupado',
    selectSlot: 'Seleccionar este horario',
    retry: 'Reintentar',
  },
  fr: {
    title: 'Planifier une Réunion',
    subtitle: 'Sélectionnez une date et une heure pour votre réunion',
    selectDate: 'Sélectionner la Date',
    availableSlots: 'Créneaux Disponibles',
    noSlotsTitle: 'Aucune disponibilité',
    noSlotsMessage: 'Aucun créneau disponible pour cette date. Veuillez essayer un autre jour.',
    loadingSlots: 'Chargement des créneaux disponibles...',
    errorTitle: 'Erreur de chargement',
    errorMessage: 'Impossible de charger les créneaux disponibles. Veuillez réessayer.',
    timezone: 'Fuseau horaire',
    duration: 'Durée',
    minutes: 'minutes',
    available: 'Disponible',
    occupied: 'Occupé',
    selectSlot: 'Sélectionner cet horaire',
    retry: 'Réessayer',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function BookingCalendar({
  locale = 'en',
  duration = 30,
  onSlotSelect,
}: BookingCalendarProps) {
  const t = translations[locale];

  // State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<SlotsResponse['metadata'] | null>(null);

  // Inicializar con fecha de mañana (no se puede agendar hoy)
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    setSelectedDate(dateString);
  }, []);

  // Fetch slots cuando cambia la fecha
  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlots = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('[BookingCalendar] Fetching slots for date:', selectedDate);
        
        const response = await fetch(
          `/api/booking/slots?date=${selectedDate}&duration=${duration}&locale=${locale}`
        );

        const data: SlotsResponse = await response.json();

        console.log('[BookingCalendar] API response:', {
          success: data.success,
          totalSlots: data.metadata?.totalSlots,
          availableSlots: data.metadata?.availableSlots,
        });

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch slots');
        }

        setSlots(data.slots);
        setMetadata(data.metadata);
      } catch (err) {
        console.error('[BookingCalendar] Error fetching slots:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, duration, locale]);

  // Handler para cambio de fecha
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  // Handler para selección de slot (Phase 2)
  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.available) return;
    
    console.log('[BookingCalendar] Slot selected:', slot);
    
    if (onSlotSelect) {
      onSlotSelect(slot);
    } else {
      // Phase 1: Solo log, no form aún
      alert(`Selected: ${slot.date} ${slot.start}-${slot.end}`);
    }
  };

  // Calcular fecha mínima (mañana) y máxima (60 días)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    return maxDate.toISOString().split('T')[0];
  };

  // Formatear fecha para display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="booking-calendar max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {t.title}
        </h2>
        <p className="text-gray-600">
          {t.subtitle}
        </p>
      </div>

      {/* Date Picker */}
      <div className="mb-8">
        <label
          htmlFor="booking-date"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t.selectDate}
        </label>
        <input
          id="booking-date"
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          min={getMinDate()}
          max={getMaxDate()}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
        />
        {selectedDate && (
          <p className="mt-2 text-sm text-gray-600">
            {formatDate(selectedDate)}
          </p>
        )}
      </div>

      {/* Metadata Info */}
      {metadata && !loading && !error && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg flex flex-wrap gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">{t.timezone}:</span>{' '}
            <span className="text-gray-600">{metadata.timezone}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">{t.duration}:</span>{' '}
            <span className="text-gray-600">{metadata.duration} {t.minutes}</span>
          </div>
          {metadata.businessHours && (
            <div>
              <span className="font-medium text-gray-700">Hours:</span>{' '}
              <span className="text-gray-600">
                {metadata.businessHours.start} - {metadata.businessHours.end}
              </span>
            </div>
          )}
          <div>
            <span className="font-medium text-gray-700">{t.available}:</span>{' '}
            <span className="text-green-600 font-semibold">
              {metadata.availableSlots}/{metadata.totalSlots}
            </span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600">{t.loadingSlots}</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <svg
              className="w-12 h-12 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              {t.errorTitle}
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => setSelectedDate(selectedDate)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {t.retry}
            </button>
          </div>
        </div>
      )}

      {/* Slots Grid */}
      {!loading && !error && slots.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {t.availableSlots}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {slots.map((slot, index) => (
              <button
                key={`${slot.date}-${slot.start}-${index}`}
                onClick={() => handleSlotClick(slot)}
                disabled={!slot.available}
                className={`
                  px-4 py-3 rounded-lg font-medium text-sm transition-all
                  ${
                    slot.available
                      ? 'bg-green-50 border-2 border-green-500 text-green-700 hover:bg-green-100 hover:shadow-md cursor-pointer'
                      : 'bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-not-allowed'
                  }
                `}
                aria-label={`${slot.start} to ${slot.end} ${slot.available ? t.available : t.occupied}`}
              >
                <div className="font-semibold">{slot.start}</div>
                <div className="text-xs">{slot.end}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && slots.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <svg
              className="w-12 h-12 text-yellow-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              {t.noSlotsTitle}
            </h3>
            <p className="text-yellow-700">
              {t.noSlotsMessage}
            </p>
          </div>
        </div>
      )}

      {/* Phase 1 Notice (remove in Phase 2) */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Phase 1 (Read-only):</strong> This calendar shows available time slots from Odoo.
          Booking form will be added in Phase 2.
        </p>
      </div>
    </div>
  );
}
