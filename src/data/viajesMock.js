/**
 * Datos ficticios para la actividad de la Semana 5.
 * Únicamente los handlers de MSW importan estos datos; las páginas consumen HTTP.
 */
export const destinos = [
  { id: 'paris', nombre: 'París', pais: 'Francia', continente: 'Europa', emoji: '🗼', color: 'azul', lema: 'Arte, cafés y rincones inolvidables', descripcion: 'Descubre museos, paseos junto al Sena y los monumentos más conocidos de la capital francesa.', actividades: ['Torre Eiffel', 'Museo del Louvre', 'Crucero por el Sena'] },
  { id: 'roma', nombre: 'Roma', pais: 'Italia', continente: 'Europa', emoji: '🏛️', color: 'terracota', lema: 'Un viaje por miles de años de historia', descripcion: 'Explora plazas, ruinas de la antigua Roma y una gastronomía llena de tradición.', actividades: ['Coliseo', 'Fontana di Trevi', 'Vaticano'] },
  { id: 'tokio', nombre: 'Tokio', pais: 'Japón', continente: 'Asia', emoji: '🌸', color: 'rosa', lema: 'Tradición y modernidad en cada esquina', descripcion: 'Una ciudad de contrastes con barrios vibrantes, templos y nuevas experiencias.', actividades: ['Templo Sensō-ji', 'Shibuya', 'Akihabara'] },
  { id: 'cusco', nombre: 'Cusco', pais: 'Perú', continente: 'Sudamérica', emoji: '⛰️', color: 'verde', lema: 'La puerta de entrada a los Andes', descripcion: 'Historia inca, paisajes montañosos y pueblos tradicionales esperan en el Valle Sagrado.', actividades: ['Machu Picchu', 'Valle Sagrado', 'Sacsayhuamán'] },
  { id: 'cancun', nombre: 'Cancún', pais: 'México', continente: 'Norteamérica', emoji: '🏖️', color: 'turquesa', lema: 'Playas para desconectar del mundo', descripcion: 'Arena blanca, aguas cálidas, cenotes y vestigios de la cultura maya.', actividades: ['Playas del Caribe', 'Cenotes', 'Chichén Itzá'] },
  { id: 'barcelona', nombre: 'Barcelona', pais: 'España', continente: 'Europa', emoji: '🎨', color: 'naranja', lema: 'Arquitectura, mar y cultura mediterránea', descripcion: 'Recorre barrios históricos, la obra de Gaudí y atractivos paseos costeros.', actividades: ['Sagrada Familia', 'Parque Güell', 'Barrio Gótico'] },
];

const tarifas = {
  paris: { vuelos: [['AF102','Air France','2027-03-12','2027-03-24',975000,8],['IB307','Iberia','2027-04-08','2027-04-20',899000,5]], hoteles: [['PA101','Hôtel Lumière',4,145000,7],['PA102','Le Jardin Paris',3,99000,4]] },
  roma: { vuelos: [['AZ501','ITA Airways','2027-03-17','2027-03-29',945000,6],['IB523','Iberia','2027-05-05','2027-05-18',870000,11]], hoteles: [['RO201','Roma Centro Suites',4,129000,6],['RO202','Trastevere House',3,82000,3]] },
  tokio: { vuelos: [['JL711','Japan Airlines','2027-04-07','2027-04-23',1380000,4],['LA910','LATAM + conexión','2027-05-12','2027-05-27',1245000,7]], hoteles: [['TO301','Sakura City Hotel',4,158000,7],['TO302','Asakusa Inn',3,107000,5]] },
  cusco: { vuelos: [['LA602','LATAM Airlines','2027-04-15','2027-04-20',329000,12],['H2512','Sky Airline','2027-06-10','2027-06-15',289000,6]], hoteles: [['CU401','Andes Boutique',4,85000,8],['CU402','Plaza Cusco Hotel',3,55000,10]] },
  cancun: { vuelos: [['AM312','Aeroméxico','2027-03-03','2027-03-13',788000,9],['LA323','LATAM Airlines','2027-05-06','2027-05-17',740000,4]], hoteles: [['CA501','Costa Azul Resort',5,215000,5],['CA502','Arena Maya Hotel',4,148000,8]] },
  barcelona: { vuelos: [['IB803','Iberia','2027-03-08','2027-03-21',920000,10],['LA420','LATAM + conexión','2027-04-16','2027-04-30',870000,6]], hoteles: [['BA601','Barcelona Central',4,135000,8],['BA602','Hotel Mediterráneo',3,89000,12]] },
};

/** Fechas, precios y disponibilidad son ejemplos académicos; no son reservas reales. */
export function opcionesDeDestino(destinoId) {
  const entrada = tarifas[destinoId];
  if (!entrada) return null;
  return {
    destinoId,
    vuelos: entrada.vuelos.map(([id,aerolinea,salida,regreso,precio,cupos])=>({
      id, aerolinea, origen:'Santiago de Chile', salida, regreso, precio, disponibles:cupos>0, cupos
    })),
    hoteles: entrada.hoteles.map(([id,nombre,estrellas,precioNoche,habitaciones])=>({
      id, nombre, estrellas, precioNoche, disponibles:habitaciones>0, habitaciones,
      fechaEntrada:entrada.vuelos[0][2], fechaSalida:entrada.vuelos[0][3]
    }))
  };
}
