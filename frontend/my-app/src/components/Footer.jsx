import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <img
              src="/images/White logo - no background_page-0001.webp"
              alt="OWC Orthowave Colombia"
              className="h-16 w-auto mb-6"
            />
            <p className="text-gray-600 text-sm leading-relaxed">
              IPS especializada en servicios de salud con énfasis en Ortopedia y Traumatología, 
              brindando soluciones integrales para la salud osteomuscular.
            </p>
            <div className="mt-6 flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-primary transition-colors duration-300"
                aria-label="Instagram"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-primary transition-colors duration-300"
                aria-label="WhatsApp"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#inicio" 
                  className="text-gray-600 hover:text-primary transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity mr-2"></span>
                  <span>Inicio</span>
                </a>
              </li>
              <li>
                <a 
                  href="#servicios" 
                  className="text-gray-600 hover:text-primary transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity mr-2"></span>
                  <span>Servicios</span>
                </a>
              </li>
              <li>
                <a 
                  href="#nosotros" 
                  className="text-gray-600 hover:text-primary transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity mr-2"></span>
                  <span>Nosotros</span>
                </a>
              </li>
              <li>
                <a 
                  href="#alianzas" 
                  className="text-gray-600 hover:text-primary transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity mr-2"></span>
                  <span>Alianzas</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Información de Contacto */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPinIcon className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-gray-600 text-sm leading-relaxed">
                  Calle 134 # 7B - 83, Consultorio 122
                  <br />
                  Edificio El Bosque, Bogotá
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <PhoneIcon className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-gray-600 text-sm">+57 311 228 1755</span>
              </li>
              <li className="flex items-center space-x-3">
                <EnvelopeIcon className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-gray-600 text-sm break-all">
                  Gerenciageneral@drorthowavecolombia.com
                </span>
              </li>
            </ul>
            </div>

          {/* Horario de Atención */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Horario de Atención</h3>
            <ul className="space-y-2">
              <li className="flex justify-between text-sm">
                <span className="text-gray-600">Lunes - Viernes</span>
                <span className="text-gray-900 font-medium">7:00 AM - 7:00 PM</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-gray-600">Sábados</span>
                <span className="text-gray-900 font-medium">8:00 AM - 1:00 PM</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-gray-600">Domingos</span>
                <span className="text-gray-500">Cerrado</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {new Date().getFullYear()} OWC Orthowave Colombia. Todos los derechos reservados.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-600 text-sm">Términos y Condiciones</a>
              <a href="#" className="text-gray-500 hover:text-gray-600 text-sm">Política de Privacidad</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 