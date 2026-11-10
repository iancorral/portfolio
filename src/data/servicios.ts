import tallerHero from '../assets/taller-hero.png';
import tallerPhone from '../assets/taller-phone.png';

export const contacto = {
  correo: 'ian.corr.mar@gmail.com',
  // Número con lada de país y sin espacios. Si se deja vacío, los botones de WhatsApp desaparecen y todo se va por correo.
  whatsapp: '526144731147',
};

export const hero = {
  etiqueta: 'Páginas web y sistemas a la medida · Chihuahua',
  lead: 'Páginas, sistemas, automatizaciones y lo que los mantiene en línea, hechos alrededor de cómo trabaja tu negocio de verdad, no con una plantilla.',
  imagen: tallerHero,
  imagenAlt: 'Página de Auto Alineaciones Luevano en una computadora.',
  celular: tallerPhone,
  celularAlt: 'La misma página de Auto Alineaciones Luevano en un celular.',
};

export const queHago = {
  intro: 'Desde una página sencilla hasta el sistema que mueve tu operación. Toma lo que te sirva o arma tu combinación.',
  cierre: '¿No ves lo que buscas? Si se resuelve con software, platiquemos.',
};

type Servicio = {
  icono: 'browser' | 'store' | 'panel' | 'bolt' | 'plug' | 'chart' | 'cloud' | 'shield' | 'compass';
  titulo: string;
  frase: string;
  ejemplos: string[];
};

export const servicios: Servicio[] = [
  {
    icono: 'browser',
    titulo: 'Páginas web',
    frase: 'Para que te encuentren en Google y te escriban directo.',
    ejemplos: ['Página de negocio', 'Landing de promoción', 'Aparecer en Google'],
  },
  {
    icono: 'panel',
    titulo: 'Sistemas a la medida',
    frase: 'Lo que hoy vive en libretas y hojas sueltas, en un solo lugar.',
    ejemplos: ['Inventario', 'Clientes y pedidos', 'Portal para tus clientes'],
  },
  {
    icono: 'bolt',
    titulo: 'Automatizaciones',
    frase: 'Las tareas repetitivas, que se hagan solas.',
    ejemplos: ['Mensajes y recordatorios', 'Formularios que llenan tu sistema', 'Reportes que llegan solos'],
  },
  {
    icono: 'store',
    titulo: 'Tiendas en línea',
    frase: 'Vende o cotiza tus productos sin depender de un marketplace.',
    ejemplos: ['Catálogo con WhatsApp', 'Pagos con tarjeta', 'Existencias al día'],
  },
  {
    icono: 'plug',
    titulo: 'Integraciones',
    frase: 'Que tus herramientas se hablen y dejes de copiar y pegar.',
    ejemplos: ['Pagos en línea', 'Google Sheets y Drive', 'APIs de otros servicios'],
  },
  {
    icono: 'chart',
    titulo: 'Datos y reportes',
    frase: 'Los números de tu negocio en una pantalla, sin pelearte con Excel.',
    ejemplos: ['Tablero de ventas', 'De Excel a una base de datos', 'Indicadores semanales'],
  },
  {
    icono: 'cloud',
    titulo: 'Servidores y nube',
    frase: 'Tu página o sistema en línea, rápido, respaldado y sin sustos.',
    ejemplos: ['Hosting, dominio y correo', 'Migración a la nube', 'Respaldos y monitoreo'],
  },
  {
    icono: 'shield',
    titulo: 'Mantenimiento y mejoras',
    frase: '¿Ya tienes algo? Lo arreglo, lo hago más rápido y le agrego lo que falta.',
    ejemplos: ['Arreglar lo que falla', 'Nuevas funciones', 'Actualizaciones de seguridad'],
  },
  {
    icono: 'compass',
    titulo: 'Asesoría técnica',
    frase: 'Antes de pagar por un software, te ayudo a ver qué te conviene.',
    ejemplos: ['Elegir herramientas', 'Revisar una cotización', 'Plan para digitalizarte'],
  },
];

export const trabajos = [
  {
    titulo: 'Auto Alineaciones Luevano',
    tipo: 'Página pública',
    texto: 'Un taller familiar con más de 50 años en Chihuahua. Sus clientes marcan qué le notan al carro y la página les arma el mensaje de WhatsApp para pedir su cotización.',
    puntos: ['Cotizador por WhatsApp', 'Una página por cada servicio', 'Cómo llegar y horario en tiempo real'],
    enlace: { texto: 'Ver la página', href: 'https://taller-luevano-web.vercel.app/' },
  },
  {
    titulo: 'Tangible',
    tipo: 'Sistema de citas',
    texto: 'Reservaciones en línea para un estudio de uñas. Solo ofrece los horarios que de verdad alcanzan y la dueña lleva todo desde su celular.',
    puntos: ['Más de 200 citas reales en tres meses', 'Pagos, ingresos y programa de lealtad', 'Sin empalmes de citas'],
    enlace: { texto: 'Ver el sitio', href: 'https://studiotangible.com.mx' },
  },
  {
    titulo: 'DARPE',
    tipo: 'Sistema interno',
    texto: 'La plataforma de una escuela de idiomas, para sustituir las hojas de cálculo por un solo sistema de maestros, alumnos y clases.',
    puntos: ['Más de 15 maestros y 6 idiomas', 'Horarios semanales recurrentes', 'Cada quien ve su clase en su hora local'],
  },
];

export const pasos = [
  { icono: 'talk', titulo: 'Platicamos', texto: 'Me cuentas cómo funciona tu negocio y qué te gustaría resolver.' },
  { icono: 'plan', titulo: 'Te propongo', texto: 'Te paso qué haríamos, cuánto cuesta y en cuánto tiempo, antes de empezar.' },
  { icono: 'build', titulo: 'Lo construimos', texto: 'Vas viendo avances y lo ajustamos contigo sobre la marcha.' },
  { icono: 'launch', titulo: 'Lo lanzamos', texto: 'Lo publicamos, lo probamos con gente real y seguimos afinando.' },
] as const;

export const preguntas = [
  {
    pregunta: '¿Cuánto cuesta?',
    respuesta: 'Depende de lo que necesites, porque no vendo paquetes iguales para todos. Cuéntame tu idea y te paso una cotización clara antes de empezar, sin compromiso.',
  },
  {
    pregunta: '¿Cuánto tarda?',
    respuesta: 'Depende del tamaño del proyecto. Las fechas van por escrito en la cotización, para que sepas qué esperar.',
  },
  {
    pregunta: 'No tengo dominio ni nada de esto, ¿importa?',
    respuesta: 'No. Te ayudo a elegir el dominio y a dejar todo configurado. Tú solo me cuentas de tu negocio.',
  },
  {
    pregunta: '¿Y si después quiero cambiar algo?',
    respuesta: 'Es normal, casi todo cambia cuando la gente lo empieza a usar. Lo vemos juntos y lo ajustamos.',
  },
  {
    pregunta: '¿Solo trabajas en Chihuahua?',
    respuesta: 'Estoy en Chihuahua, pero puedo trabajar a distancia con negocios de cualquier parte.',
  },
];

export const necesidades = [
  'Página para mi negocio',
  'Tienda en línea',
  'Sistema a la medida',
  'Automatizar algo',
  'Conectar mis herramientas',
  'Reportes o datos',
  'Hosting o servidores',
  'Mejorar lo que ya tengo',
  'Asesoría',
  'Todavía no sé',
];
