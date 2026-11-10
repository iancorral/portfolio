import tallerHero from '../assets/taller-hero.png';
import tallerPhone from '../assets/taller-phone.png';

export const contacto = {
  correo: 'ian.corr.mar@gmail.com',
  // Número con lada de país y sin espacios. Si se deja vacío, los botones de WhatsApp desaparecen y todo se va por correo.
  whatsapp: '526144731147',
};

export const hero = {
  etiqueta: 'Páginas web y sistemas a la medida · Chihuahua',
  lead: 'Diseño y construyo páginas, tiendas en línea y sistemas internos alrededor de cómo trabaja tu negocio de verdad, no con una plantilla.',
  imagen: tallerHero,
  imagenAlt: 'Página de Auto Alineaciones Luevano en una computadora.',
  celular: tallerPhone,
  celularAlt: 'La misma página de Auto Alineaciones Luevano en un celular.',
};

export const queHago = {
  intro: 'Si tu negocio lo hace a mano todos los días, casi seguro se puede automatizar.',
  cierre: '¿Tienes otra idea? Si se puede hacer con una computadora y te ahorra tiempo, platiquemos.',
};

type Servicio = {
  icono: 'browser' | 'store' | 'panel' | 'bolt' | 'chart' | 'shield';
  titulo: string;
  frase: string;
  ejemplos: string[];
  // Un ejemplo de cómo se ve una automatización, paso por paso.
  flujo?: string[];
};

export const servicios: Servicio[] = [
  {
    icono: 'bolt',
    titulo: 'Automatizaciones',
    frase: 'Lo que haces a mano todos los días, que se haga solo.',
    ejemplos: ['Recordatorios por WhatsApp', 'Respuestas automáticas', 'Formularios que llenan tu sistema', 'Reportes que llegan solos', 'Conectar tus apps'],
    flujo: ['Tu cliente agenda', 'Le llega su confirmación', 'Se anota en tu calendario', 'Un día antes, su recordatorio'],
  },
  {
    icono: 'browser',
    titulo: 'Páginas web',
    frase: 'Para que te encuentren en Google y te escriban por WhatsApp.',
    ejemplos: ['Página de negocio', 'Landing de promoción', 'Menú o catálogo', 'Aparecer en Google'],
  },
  {
    icono: 'panel',
    titulo: 'Sistemas a la medida',
    frase: 'El sistema que tu negocio necesita, no el que trae una plantilla.',
    ejemplos: ['Citas y reservas', 'Clientes', 'Inventario', 'Panel de administración', 'Portal para tus clientes'],
  },
  {
    icono: 'store',
    titulo: 'Tiendas y catálogos',
    frase: 'Tus productos con fotos y precios, listos para vender o cotizar.',
    ejemplos: ['Catálogo con WhatsApp', 'Pagos en línea', 'Cotizador', 'Existencias al día'],
  },
  {
    icono: 'chart',
    titulo: 'Datos y reportes',
    frase: 'Los números de tu negocio en una pantalla, sin pelearte con Excel.',
    ejemplos: ['Tablero de ventas', 'De Excel a un sistema', 'Reportes para tomar decisiones'],
  },
  {
    icono: 'shield',
    titulo: 'Hosting y mantenimiento',
    frase: 'Tu página siempre arriba, segura y al día, sin que tengas que pensarlo.',
    ejemplos: ['Dominio y correo', 'Respaldos', 'Actualizaciones', 'Seguridad'],
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

export const necesidades = ['Página para mi negocio', 'Tienda o catálogo', 'Sistema a la medida', 'Automatizar algo', 'Reportes o datos', 'Mejorar lo que ya tengo', 'Todavía no sé'];
