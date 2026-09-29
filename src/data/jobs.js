/**
 * Catalogo de ejemplo multisectorial.
 * Reemplazable por la respuesta del Job Discovery Service (Python + APIs de empleo).
 * Cada vacante declara su sector para que la busqueda no dependa de un rubro en particular.
 */

export const sectores = [
  'Administracion y finanzas',
  'Atencion al cliente',
  'Diseno y comunicacion',
  'Educacion',
  'Gastronomia y turismo',
  'Ingenieria y construccion',
  'Legal',
  'Logistica y operaciones',
  'Marketing y ventas',
  'Recursos humanos',
  'Salud',
  'Tecnologia'
]

export const vacantes = [
  {
    id: 'jd-001',
    titulo: 'Practicante de Contabilidad',
    empresa: 'Estudio Vera & Asociados',
    sector: 'Administracion y finanzas',
    ubicacion: 'San Isidro, Lima',
    modalidad: 'Presencial',
    nivel: 'Practicante',
    publicada: '2026-09-17',
    sueldoMin: 1200,
    sueldoMax: 1500,
    fuente: 'Computrabajo',
    descripcion:
      'Apoyaras en el registro de comprobantes, la conciliacion de cuentas y la preparacion de declaraciones mensuales para cartera de clientes pyme.',
    responsabilidades: [
      'Registrar comprobantes en el sistema contable',
      'Conciliar cuentas bancarias mensualmente',
      'Apoyar en la preparacion de declaraciones a SUNAT'
    ],
    hardSkills: ['Excel', 'Contabilidad general', 'SUNAT', 'Conciliacion bancaria'],
    softSkills: ['Orden', 'Atencion al detalle']
  },
  {
    id: 'jd-002',
    titulo: 'Asistente de Recursos Humanos',
    empresa: 'Farmacias Peruanas',
    sector: 'Recursos humanos',
    ubicacion: 'Surquillo, Lima',
    modalidad: 'Hibrido',
    nivel: 'Junior',
    publicada: '2026-09-18',
    sueldoMin: 2200,
    sueldoMax: 2800,
    fuente: 'Bumeran',
    descripcion:
      'Daras soporte al equipo de atraccion de talento en la publicacion de vacantes, el filtro de postulantes y la coordinacion de entrevistas para tiendas de Lima.',
    responsabilidades: [
      'Publicar vacantes y filtrar postulantes',
      'Coordinar entrevistas con jefes de tienda',
      'Mantener actualizada la base de candidatos'
    ],
    hardSkills: ['Reclutamiento y seleccion', 'Excel', 'Entrevista por competencias'],
    softSkills: ['Comunicacion', 'Empatia', 'Organizacion']
  },
  {
    id: 'jd-003',
    titulo: 'Practicante de Enfermeria',
    empresa: 'Clinica Ricardo Palma',
    sector: 'Salud',
    ubicacion: 'San Isidro, Lima',
    modalidad: 'Presencial',
    nivel: 'Practicante',
    publicada: '2026-09-15',
    sueldoMin: 1100,
    sueldoMax: 1400,
    fuente: 'Computrabajo',
    descripcion:
      'Apoyaras en el cuidado de pacientes hospitalizados bajo supervision, registrando signos vitales y colaborando en procedimientos de baja complejidad.',
    responsabilidades: [
      'Tomar y registrar signos vitales',
      'Apoyar en la preparacion de materiales y curaciones',
      'Registrar la atencion en la historia clinica'
    ],
    hardSkills: ['Signos vitales', 'Bioseguridad', 'Historia clinica', 'Primeros auxilios'],
    softSkills: ['Empatia', 'Trabajo bajo presion', 'Trabajo en equipo']
  },
  {
    id: 'jd-004',
    titulo: 'Docente de Primaria',
    empresa: 'Colegio Santa Maria',
    sector: 'Educacion',
    ubicacion: 'Los Olivos, Lima',
    modalidad: 'Presencial',
    nivel: 'Junior',
    publicada: '2026-09-11',
    sueldoMin: 2400,
    sueldoMax: 3100,
    fuente: 'Bumeran',
    descripcion:
      'Conduciras un aula de cuarto grado, disenando sesiones alineadas al Curriculo Nacional y acompanando el avance de cada estudiante.',
    responsabilidades: [
      'Planificar sesiones de aprendizaje',
      'Evaluar por competencias y registrar avances',
      'Comunicar el progreso a las familias'
    ],
    hardSkills: ['Planificacion curricular', 'Evaluacion por competencias', 'Curriculo Nacional'],
    softSkills: ['Comunicacion', 'Paciencia', 'Creatividad']
  },
  {
    id: 'jd-005',
    titulo: 'Practicante de Marketing Digital',
    empresa: 'Crehana',
    sector: 'Marketing y ventas',
    ubicacion: 'Lima',
    modalidad: 'Remoto',
    nivel: 'Practicante',
    publicada: '2026-09-16',
    sueldoMin: 1200,
    sueldoMax: 1500,
    fuente: 'Computrabajo',
    descripcion:
      'Apoyaras en la ejecucion de campanas de captacion y en el analisis de metricas de conversion por canal.',
    responsabilidades: [
      'Programar campanas en redes sociales',
      'Medir resultados y armar reportes semanales',
      'Coordinar piezas con el equipo de diseno'
    ],
    hardSkills: ['Google Analytics', 'Excel', 'SEO', 'Redes sociales'],
    softSkills: ['Creatividad', 'Comunicacion']
  },
  {
    id: 'jd-006',
    titulo: 'Asistente Legal Corporativo',
    empresa: 'Rebaza, Alcazar & De Las Casas',
    sector: 'Legal',
    ubicacion: 'San Isidro, Lima',
    modalidad: 'Hibrido',
    nivel: 'Junior',
    publicada: '2026-09-13',
    sueldoMin: 2600,
    sueldoMax: 3400,
    fuente: 'LinkedIn',
    descripcion:
      'Apoyaras al area corporativa en la revision de contratos, la gestion de expedientes y el seguimiento de plazos societarios.',
    responsabilidades: [
      'Revisar y sumillar contratos',
      'Gestionar expedientes y archivo digital',
      'Hacer seguimiento a plazos en Registros Publicos'
    ],
    hardSkills: ['Redaccion de contratos', 'Derecho societario', 'Gestion de expedientes', 'Excel'],
    softSkills: ['Atencion al detalle', 'Redaccion', 'Organizacion']
  },
  {
    id: 'jd-007',
    titulo: 'Practicante de Desarrollo Backend',
    empresa: 'Interbank',
    sector: 'Tecnologia',
    ubicacion: 'San Isidro, Lima',
    modalidad: 'Hibrido',
    nivel: 'Practicante',
    publicada: '2026-09-17',
    sueldoMin: 1300,
    sueldoMax: 1700,
    fuente: 'Computrabajo',
    descripcion:
      'Apoyaras al equipo de plataformas digitales en el mantenimiento de APIs internas, la escritura de pruebas y la documentacion de servicios.',
    responsabilidades: [
      'Desarrollar endpoints REST siguiendo los estandares del equipo',
      'Escribir pruebas unitarias y de integracion',
      'Participar en las ceremonias de Scrum del squad'
    ],
    hardSkills: ['Python', 'SQL', 'Git', 'Docker', 'REST'],
    softSkills: ['Trabajo en equipo', 'Comunicacion']
  },
  {
    id: 'jd-008',
    titulo: 'Analista de Datos Junior',
    empresa: 'Alicorp',
    sector: 'Administracion y finanzas',
    ubicacion: 'Callao',
    modalidad: 'Presencial',
    nivel: 'Junior',
    publicada: '2026-09-12',
    sueldoMin: 2800,
    sueldoMax: 3500,
    fuente: 'Bumeran',
    descripcion:
      'Daras soporte al area comercial construyendo tableros de seguimiento y automatizando reportes mensuales de venta por canal.',
    responsabilidades: [
      'Construir tableros en Power BI',
      'Automatizar reportes recurrentes',
      'Validar la calidad de la data cargada'
    ],
    hardSkills: ['SQL', 'Power BI', 'Excel', 'Analisis de datos'],
    softSkills: ['Pensamiento analitico', 'Orden']
  },
  {
    id: 'jd-009',
    titulo: 'Coordinador de Almacen',
    empresa: 'Ransa',
    sector: 'Logistica y operaciones',
    ubicacion: 'Lurin, Lima',
    modalidad: 'Presencial',
    nivel: 'Semi senior',
    publicada: '2026-09-09',
    sueldoMin: 3800,
    sueldoMax: 4800,
    fuente: 'Computrabajo',
    descripcion:
      'Lideraras la operacion diaria de un almacen de consumo masivo, cuidando el inventario, la productividad del equipo y el cumplimiento de despachos.',
    responsabilidades: [
      'Controlar inventarios y mermas',
      'Programar turnos del personal operativo',
      'Asegurar el cumplimiento de despachos diarios'
    ],
    hardSkills: ['Gestion de inventarios', 'SAP', 'Excel', 'Seguridad y salud ocupacional'],
    softSkills: ['Liderazgo', 'Toma de decisiones', 'Comunicacion']
  },
  {
    id: 'jd-010',
    titulo: 'Asesor de Atencion al Cliente',
    empresa: 'Entel',
    sector: 'Atencion al cliente',
    ubicacion: 'Lima',
    modalidad: 'Remoto',
    nivel: 'Junior',
    publicada: '2026-09-19',
    sueldoMin: 1800,
    sueldoMax: 2400,
    fuente: 'Bumeran',
    descripcion:
      'Atenderas consultas y reclamos de clientes por telefono y chat, buscando resolver en el primer contacto y registrando cada caso en el CRM.',
    responsabilidades: [
      'Atender consultas y reclamos por canales digitales',
      'Registrar cada caso en el CRM',
      'Escalar incidencias segun el procedimiento'
    ],
    hardSkills: ['CRM', 'Atencion telefonica', 'Gestion de reclamos'],
    softSkills: ['Paciencia', 'Comunicacion', 'Manejo de objeciones']
  },
  {
    id: 'jd-011',
    titulo: 'Practicante de Arquitectura',
    empresa: 'Grana y Montero',
    sector: 'Ingenieria y construccion',
    ubicacion: 'Surco, Lima',
    modalidad: 'Hibrido',
    nivel: 'Practicante',
    publicada: '2026-09-14',
    sueldoMin: 1300,
    sueldoMax: 1700,
    fuente: 'LinkedIn',
    descripcion:
      'Apoyaras en el desarrollo de planos, la elaboracion de metrados y el seguimiento de observaciones en obra para proyectos de vivienda.',
    responsabilidades: [
      'Dibujar y actualizar planos del proyecto',
      'Elaborar metrados y cuadros de acabados',
      'Acompanar visitas a obra y levantar observaciones'
    ],
    hardSkills: ['AutoCAD', 'Revit', 'Metrados', 'SketchUp'],
    softSkills: ['Atencion al detalle', 'Trabajo en equipo']
  },
  {
    id: 'jd-012',
    titulo: 'Disenador Grafico Junior',
    empresa: 'Estudio Mimo',
    sector: 'Diseno y comunicacion',
    ubicacion: 'Barranco, Lima',
    modalidad: 'Hibrido',
    nivel: 'Junior',
    publicada: '2026-09-10',
    sueldoMin: 2300,
    sueldoMax: 3000,
    fuente: 'LinkedIn',
    descripcion:
      'Produciras piezas graficas para campanas de marca, cuidando la coherencia visual entre canales digitales e impresos.',
    responsabilidades: [
      'Disenar piezas para redes y medios impresos',
      'Adaptar campanas a distintos formatos',
      'Presentar propuestas al equipo de cuentas'
    ],
    hardSkills: ['Illustrator', 'Photoshop', 'Figma', 'Identidad de marca'],
    softSkills: ['Creatividad', 'Apertura a feedback']
  },
  {
    id: 'jd-013',
    titulo: 'Supervisor de Salon',
    empresa: 'Central Restaurante',
    sector: 'Gastronomia y turismo',
    ubicacion: 'Barranco, Lima',
    modalidad: 'Presencial',
    nivel: 'Semi senior',
    publicada: '2026-09-08',
    sueldoMin: 3200,
    sueldoMax: 4200,
    fuente: 'Computrabajo',
    descripcion:
      'Coordinaras al equipo de salon durante el servicio, cuidando la experiencia del comensal y el cumplimiento de estandares de atencion.',
    responsabilidades: [
      'Coordinar al equipo durante el servicio',
      'Supervisar montaje y estandares de atencion',
      'Resolver incidencias con comensales'
    ],
    hardSkills: ['Atencion en salon', 'Manejo de reservas', 'Ingles', 'BPM y sanidad'],
    softSkills: ['Liderazgo', 'Trabajo bajo presion', 'Servicio al cliente']
  },
  {
    id: 'jd-014',
    titulo: 'Psicologo Organizacional Junior',
    empresa: 'Cencosud',
    sector: 'Recursos humanos',
    ubicacion: 'San Borja, Lima',
    modalidad: 'Hibrido',
    nivel: 'Junior',
    publicada: '2026-09-16',
    sueldoMin: 2700,
    sueldoMax: 3400,
    fuente: 'LinkedIn',
    descripcion:
      'Participaras en procesos de seleccion, evaluaciones psicotecnicas y programas de clima laboral para tiendas de Lima y provincias.',
    responsabilidades: [
      'Aplicar y calificar evaluaciones psicotecnicas',
      'Conducir entrevistas por competencias',
      'Apoyar en programas de clima y capacitacion'
    ],
    hardSkills: ['Evaluacion psicotecnica', 'Entrevista por competencias', 'Excel', 'Clima laboral'],
    softSkills: ['Empatia', 'Comunicacion', 'Confidencialidad']
  },
  {
    id: 'jd-015',
    titulo: 'Desarrollador Frontend Junior',
    empresa: 'Rappi',
    sector: 'Tecnologia',
    ubicacion: 'Miraflores, Lima',
    modalidad: 'Remoto',
    nivel: 'Junior',
    publicada: '2026-09-15',
    sueldoMin: 3000,
    sueldoMax: 4200,
    fuente: 'LinkedIn',
    descripcion:
      'Construiras interfaces para el panel de aliados comerciales, con criterio de producto y componentes reutilizables.',
    responsabilidades: [
      'Implementar vistas con Vue 3',
      'Mantener la libreria de componentes del equipo',
      'Optimizar tiempos de carga del panel'
    ],
    hardSkills: ['Vue', 'JavaScript', 'CSS', 'Git'],
    softSkills: ['Autonomia', 'Comunicacion']
  }
]

/** Habilidades blandas que aplican a cualquier sector. */
export const habilidadesBlandas = [
  'Comunicacion', 'Trabajo en equipo', 'Organizacion', 'Atencion al detalle',
  'Pensamiento analitico', 'Liderazgo', 'Empatia', 'Autonomia', 'Creatividad',
  'Trabajo bajo presion', 'Servicio al cliente', 'Negociacion', 'Redaccion',
  'Toma de decisiones', 'Adaptabilidad'
]

/** Habilidades tecnicas por sector. La lista crece sin tocar componentes. */
export const habilidadesPorSector = {
  'Administracion y finanzas': [
    'Excel', 'Contabilidad general', 'SUNAT', 'Conciliacion bancaria', 'SAP',
    'Analisis financiero', 'Power BI', 'Tesoreria', 'Costos y presupuestos'
  ],
  'Atencion al cliente': ['CRM', 'Atencion telefonica', 'Gestion de reclamos', 'Ventas', 'Salesforce'],
  'Diseno y comunicacion': [
    'Illustrator', 'Photoshop', 'Figma', 'InDesign', 'Identidad de marca',
    'Edicion de video', 'Redaccion publicitaria', 'Fotografia'
  ],
  Educacion: [
    'Planificacion curricular', 'Evaluacion por competencias', 'Curriculo Nacional',
    'Gestion de aula', 'Educacion inclusiva', 'Aulas virtuales'
  ],
  'Gastronomia y turismo': [
    'Atencion en salon', 'Manejo de reservas', 'BPM y sanidad', 'Costeo de carta',
    'Barismo', 'Ingles', 'Gestion de proveedores'
  ],
  'Ingenieria y construccion': [
    'AutoCAD', 'Revit', 'SketchUp', 'Metrados', 'MS Project', 'Expedientes tecnicos',
    'Seguridad y salud ocupacional', 'Control de calidad'
  ],
  Legal: [
    'Redaccion de contratos', 'Derecho societario', 'Derecho laboral',
    'Gestion de expedientes', 'Litigio', 'Cumplimiento normativo'
  ],
  'Logistica y operaciones': [
    'Gestion de inventarios', 'SAP', 'Distribucion', 'Compras', 'Kardex',
    'Mejora continua', 'Seguridad y salud ocupacional'
  ],
  'Marketing y ventas': [
    'Google Analytics', 'SEO', 'Redes sociales', 'Google Ads', 'Email marketing',
    'Investigacion de mercado', 'CRM', 'Prospeccion comercial'
  ],
  'Recursos humanos': [
    'Reclutamiento y seleccion', 'Entrevista por competencias', 'Evaluacion psicotecnica',
    'Planillas', 'Clima laboral', 'Capacitacion', 'Legislacion laboral'
  ],
  Salud: [
    'Signos vitales', 'Bioseguridad', 'Historia clinica', 'Primeros auxilios',
    'Farmacologia basica', 'Atencion al paciente', 'Triaje'
  ],
  Tecnologia: [
    'Python', 'Java', 'C#', 'JavaScript', 'Vue', 'React', 'Angular', 'SQL',
    'PostgreSQL', 'Docker', 'AWS', 'Git', 'REST', 'CI/CD', 'Selenium', 'Scrum'
  ]
}

/**
 * Sugerencias para el selector de habilidades.
 * Sin sector elegido devuelve todo; con sector, prioriza lo de ese rubro.
 */
export function sugerenciasDeHabilidades(sector) {
  const tecnicas = sector && habilidadesPorSector[sector]
    ? habilidadesPorSector[sector]
    : Object.values(habilidadesPorSector).flat()
  return [...new Set([...tecnicas, ...habilidadesBlandas])]
}

/** Compatibilidad con el nombre anterior. */
export const habilidadesSugeridas = sugerenciasDeHabilidades()
