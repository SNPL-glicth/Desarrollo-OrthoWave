import React, { useState, useEffect } from 'react';
import { productsService, ReservationSummary } from '../../services/productsService';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ProductReservationStatus: React.FC = () => {
  const [summary, setSummary] = useState<ReservationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReservationSummary();
  }, []);

  const loadReservationSummary = async () => {
    try {
      setLoading(true);
      const data = await productsService.getMyReservationSummary();
      setSummary(data);
    } catch (error) {
      console.error('Error loading reservation summary:', error);
      setError('Error al cargar las reservas de productos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'delivered':
        return <Truck className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmado';
      case 'delivered':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered':
        return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-red-600">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!summary || (summary.pending.length === 0 && summary.confirmed.length === 0 && summary.delivered.length === 0)) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">No tienes productos reservados</h3>
          <p className="text-sm">Visita nuestra página principal para explorar productos disponibles</p>
        </div>
      </div>
    );
  }

  const allReservations = [
    ...summary.pending,
    ...summary.confirmed,
    ...summary.delivered
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Productos Reservados
          </h2>
          
          {/* Summary stats */}
          <div className="flex gap-4 text-sm">
            {summary.pending.length > 0 && (
              <div className="flex items-center gap-1 text-orange-600">
                <Clock className="w-4 h-4" />
                {summary.pending.length} pendiente{summary.pending.length !== 1 ? 's' : ''}
              </div>
            )}
            {summary.confirmed.length > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                {summary.confirmed.length} confirmado{summary.confirmed.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Total amounts */}
        {(summary.totalPending > 0 || summary.totalConfirmed > 0) && (
          <div className="mt-4 flex gap-6 text-sm">
            {summary.totalPending > 0 && (
              <div>
                <span className="text-gray-600">Total pendiente: </span>
                <span className="font-medium text-orange-600">
                  {formatPrice(summary.totalPending)}
                </span>
              </div>
            )}
            {summary.totalConfirmed > 0 && (
              <div>
                <span className="text-gray-600">Total confirmado: </span>
                <span className="font-medium text-green-600">
                  {formatPrice(summary.totalConfirmed)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reservations list */}
      <div className="p-6">
        <div className="space-y-4">
          {allReservations.map((reservation) => (
            <motion.div
              key={reservation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100"
            >
              {/* Product image */}
              <img
                src={reservation.product.image_url}
                alt={reservation.product.name}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/64x64/E5E7EB/9CA3AF?text=Sin+Imagen';
                }}
              />

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-800 line-clamp-2">
                    {reservation.product.name}
                  </h4>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClasses(reservation.status)}`}>
                    {getStatusIcon(reservation.status)}
                    {getStatusText(reservation.status)}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span>Cantidad: {reservation.quantity}</span>
                  <span>•</span>
                  <span>{formatPrice(reservation.unit_price)} c/u</span>
                  <span>•</span>
                  <span className="font-medium text-gray-800">
                    Total: {formatPrice(reservation.total_price)}
                  </span>
                </div>

                <div className="text-xs text-gray-500">
                  Reservado el {formatDate(reservation.created_at)}
                  {reservation.confirmed_at && (
                    <span> • Confirmado el {formatDate(reservation.confirmed_at)}</span>
                  )}
                </div>

                {reservation.notes && (
                  <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded border">
                    <span className="font-medium">Notas: </span>
                    {reservation.notes}
                  </div>
                )}

                {reservation.doctor_notes && (
                  <div className="mt-2 text-sm text-primary-700 bg-primary-50 p-2 rounded border border-primary-200">
                    <span className="font-medium">Notas del doctor: </span>
                    {reservation.doctor_notes}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info message */}
        <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="text-sm">
              <h4 className="font-medium text-primary-700 mb-1">Información importante</h4>
              <ul className="text-primary-700 space-y-1">
                <li>• Los productos <strong>pendientes</strong> deben ser confirmados por el doctor</li>
                <li>• Los productos <strong>confirmados</strong> pueden recogerse en la clínica</li>
                <li>• El pago se realiza al momento de la entrega</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReservationStatus;
