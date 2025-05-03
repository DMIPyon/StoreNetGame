"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'netgames',
    password: 'doma1128',
    port: 5433,
});
async function seed() {
    try {
        // Limpiar tablas principales
        await pool.query('DELETE FROM games;');
        await pool.query('DELETE FROM categories;');
        await pool.query('DELETE FROM developers;');
        // Insertar categorías de ejemplo
        const categories = [
            { name: 'Acción', icon: 'flame-outline', slug: 'accion', description: 'Juegos llenos de adrenalina y acción.' },
            { name: 'Aventura', icon: 'map-outline', slug: 'aventura', description: 'Explora mundos y vive historias.' },
            { name: 'Estrategia', icon: 'bulb-outline', slug: 'estrategia', description: 'Pon a prueba tu mente.' },
            { name: 'RPG', icon: 'game-controller-outline', slug: 'rpg', description: 'Vive grandes aventuras y sube de nivel.' },
            { name: 'Deportes', icon: 'football-outline', slug: 'deportes', description: 'Compite y sé el mejor.' },
            { name: 'Carreras', icon: 'car-sport-outline', slug: 'carreras', description: 'Velocidad y emoción.' },
            { name: 'Shooter', icon: 'aperture-outline', slug: 'shooter', description: 'Dispara y sobrevive.' },
            { name: 'Simulación', icon: 'construct-outline', slug: 'simulacion', description: 'Simula la vida real o fantástica.' },
            { name: 'Indie', icon: 'flash-outline', slug: 'indie', description: 'Juegos independientes y creativos.' },
            { name: 'Terror', icon: 'skull-outline', slug: 'terror', description: 'Sustos y emociones fuertes.' },
            { name: 'Puzzle', icon: 'cube-outline', slug: 'puzzle', description: 'Desafía tu mente con acertijos.' },
            { name: 'Sandbox', icon: 'cube-outline', slug: 'sandbox', description: 'Crea y explora sin límites.' },
            { name: 'Plataformas', icon: 'layers-outline', slug: 'plataformas', description: 'Salta y explora niveles.' },
            { name: 'Lucha', icon: 'body-outline', slug: 'lucha', description: 'Combate cuerpo a cuerpo.' },
            { name: 'Casual', icon: 'happy-outline', slug: 'casual', description: 'Juegos para todos los públicos.' },
            { name: 'Mundo Abierto', icon: 'earth-outline', slug: 'mundo-abierto', description: 'Explora grandes mundos sin límites.' },
            { name: 'Cooperativo', icon: 'people-outline', slug: 'cooperativo', description: 'Juega en equipo con amigos.' },
            { name: 'Multijugador', icon: 'people-circle-outline', slug: 'multijugador', description: 'Compite o coopera con otros jugadores.' },
            { name: 'Ciencia Ficción', icon: 'planet-outline', slug: 'ciencia-ficcion', description: 'Viajes espaciales y tecnología.' },
            { name: 'Fantasía', icon: 'sparkles-outline', slug: 'fantasia', description: 'Magia y mundos imaginarios.' },
            { name: 'Supervivencia', icon: 'leaf-outline', slug: 'supervivencia', description: 'Sobrevive en entornos hostiles.' },
            { name: 'Construcción', icon: 'hammer-outline', slug: 'construccion', description: 'Crea y gestiona recursos.' },
            { name: 'Roguelike', icon: 'shuffle-outline', slug: 'roguelike', description: 'Niveles y desafíos aleatorios.' },
            { name: 'Metroidvania', icon: 'git-branch-outline', slug: 'metroidvania', description: 'Explora y desbloquea habilidades.' },
            { name: 'Point & Click', icon: 'hand-left-outline', slug: 'point-click', description: 'Aventuras gráficas clásicas.' }
        ];
        const categoryIds = [];
        for (const cat of categories) {
            const res = await pool.query('INSERT INTO categories (name, icon, slug, description) VALUES ($1, $2, $3, $4) RETURNING id', [cat.name, cat.icon, cat.slug, cat.description]);
            categoryIds.push(res.rows[0].id);
        }
        // Insertar desarrolladores de ejemplo
        const developers = [
            { name: 'Rockstar Games', website: 'https://www.rockstargames.com/' },
            { name: 'CD Projekt', website: 'https://en.cdprojektred.com/' },
            { name: 'Nintendo', website: 'https://www.nintendo.com/' },
            { name: 'Ubisoft', website: 'https://www.ubisoft.com/' },
            { name: 'Electronic Arts', website: 'https://www.ea.com/' },
            { name: 'Sony Interactive', website: 'https://www.playstation.com/' },
            { name: 'Valve', website: 'https://www.valvesoftware.com/' },
            { name: 'Bethesda', website: 'https://bethesda.net/' },
            { name: 'Unknown Worlds Entertainment', website: 'https://unknownworlds.com/' },
            { name: 'Facepunch Studios', website: 'https://www.facepunch.com/' },
            { name: 'Warner Bros. Games', website: 'https://www.wbgames.com/' },
            { name: 'Techland', website: 'https://techland.net/' },
            { name: 'Endnight Games Ltd', website: 'https://endnightgames.com/' },
            { name: 'Iron Gate AB', website: 'https://irongatestudio.se/' }
        ];
        const developerIds = [];
        for (const dev of developers) {
            const res = await pool.query('INSERT INTO developers (name, website) VALUES ($1, $2) RETURNING id', [dev.name, dev.website]);
            developerIds.push(res.rows[0].id);
        }
        const juegos = [
            {
                title: "The Witcher 3: Wild Hunt",
                description: "Embárcate en una épica aventura de mundo abierto como Geralt de Rivia, un cazador de monstruos profesional. Explora reinos, toma decisiones y enfréntate a criaturas legendarias.",
                price: 29990,
                original_price: 49990,
                discount: 40,
                rating: 4.9,
                developer_id: developerIds[1],
                release_date: '2015-05-19',
                categories: [categoryIds[3], categoryIds[1], categoryIds[15], categoryIds[19]], // RPG, Aventura, Mundo Abierto, Fantasía
                cover_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_600x900.jpg",
                banner_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg",
                requirements_min_os: "Windows 7 64-bit",
                requirements_min_processor: "Intel Core i5-2500K 3.3GHz / AMD Phenom II X4 940",
                requirements_min_memory: "6 GB RAM",
                requirements_min_graphics: "Nvidia GeForce GTX 660 / AMD Radeon HD 7870",
                requirements_min_storage: "35 GB disponibles",
                requirements_rec_os: "Windows 10 64-bit",
                requirements_rec_processor: "Intel Core i7 3770 3.4 GHz / AMD FX-8350 4 GHz",
                requirements_rec_memory: "8 GB RAM",
                requirements_rec_graphics: "Nvidia GeForce GTX 770 / AMD Radeon R9 290",
                requirements_rec_storage: "35 GB disponibles"
            },
            {
                title: "Grand Theft Auto V",
                description: "Vive la experiencia de Los Santos en un mundo abierto lleno de acción, crimen y posibilidades infinitas.",
                price: 24990,
                original_price: 39990,
                discount: 38,
                rating: 4.8,
                developer_id: developerIds[0],
                release_date: '2013-09-17',
                categories: [categoryIds[0], categoryIds[15], categoryIds[5], categoryIds[11]], // Acción, Mundo Abierto, Carreras, Sandbox
                cover_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/library_600x900.jpg",
                banner_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg",
                requirements_min_os: "Windows 7 64-bit",
                requirements_min_processor: "Intel Core 2 Quad CPU Q6600 @ 2.40GHz",
                requirements_min_memory: "4 GB RAM",
                requirements_min_graphics: "NVIDIA 9800 GT 1GB / AMD HD 4870 1GB",
                requirements_min_storage: "72 GB disponibles",
                requirements_rec_os: "Windows 10 64-bit",
                requirements_rec_processor: "Intel Core i5 3470 @ 3.2GHZ / AMD X8 FX-8350 @ 4GHZ",
                requirements_rec_memory: "8 GB RAM",
                requirements_rec_graphics: "NVIDIA GTX 660 2GB / AMD HD7870 2GB",
                requirements_rec_storage: "72 GB disponibles"
            },
            {
                title: "Red Dead Redemption 2",
                description: "Sumérgete en el salvaje oeste con Arthur Morgan y la banda de Van der Linde en una historia épica de honor y lealtad.",
                price: 34990,
                original_price: 59990,
                discount: 42,
                rating: 4.9,
                developer_id: developerIds[0],
                release_date: '2018-10-26',
                categories: [categoryIds[1], categoryIds[15], categoryIds[0], categoryIds[19]], // Aventura, Mundo Abierto, Acción, Fantasía
                cover_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/library_600x900.jpg",
                banner_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg",
                requirements_min_os: "Windows 7 64-bit",
                requirements_min_processor: "Intel Core i5-2500K / AMD FX-6300",
                requirements_min_memory: "8 GB RAM",
                requirements_min_graphics: "Nvidia GeForce GTX 770 2GB / AMD Radeon R9 280 3GB",
                requirements_min_storage: "150 GB disponibles",
                requirements_rec_os: "Windows 10 64-bit",
                requirements_rec_processor: "Intel Core i7-4770K / AMD Ryzen 5 1500X",
                requirements_rec_memory: "12 GB RAM",
                requirements_rec_graphics: "Nvidia GeForce GTX 1060 6GB / AMD Radeon RX 480 4GB",
                requirements_rec_storage: "150 GB disponibles"
            },
            {
                title: "FIFA 23",
                description: "Disfruta del fútbol más realista con nuevas mecánicas, equipos y modos de juego en FIFA 23.",
                price: 39990,
                original_price: 59990,
                discount: 33,
                rating: 4.5,
                developer_id: developerIds[4],
                release_date: '2022-09-30',
                categories: [categoryIds[4]], // Deportes
                cover_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/1811260/library_600x900.jpg",
                banner_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/1811260/header.jpg",
                requirements_min_os: "Windows 10 64-bit",
                requirements_min_processor: "Intel Core i5-6600k / AMD Ryzen 5 1600",
                requirements_min_memory: "8 GB RAM",
                requirements_min_graphics: "NVIDIA GeForce GTX 1050 Ti / AMD Radeon RX 570",
                requirements_min_storage: "100 GB disponibles",
                requirements_rec_os: "Windows 10 64-bit",
                requirements_rec_processor: "Intel i7-6700 / AMD Ryzen 7 2700X",
                requirements_rec_memory: "12 GB RAM",
                requirements_rec_graphics: "NVIDIA GeForce GTX 1660 / AMD RX 5600 XT",
                requirements_rec_storage: "100 GB disponibles"
            },
            {
                title: "Subnautica: Below Zero",
                description: "Explora un mundo oceánico alienígena en este juego de supervivencia en primera persona. Recolecta recursos, construye bases y descubre los misterios de un planeta helado.",
                price: 15490,
                original_price: 30990,
                discount: 50,
                rating: 4.7,
                developer_id: developerIds[8],
                release_date: '2021-05-14',
                categories: [categoryIds[1], categoryIds[20], categoryIds[3], categoryIds[15]], // Aventura, Supervivencia, RPG, Mundo abierto
                cover_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/848450/library_600x900.jpg",
                banner_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/848450/header.jpg",
                requirements_min_os: "Windows 7 64-bit",
                requirements_min_processor: "Intel Core i3 / AMD Ryzen 3",
                requirements_min_memory: "8 GB RAM",
                requirements_min_graphics: "Intel HD 530 / NVIDIA GTX 1050 / AMD Radeon 530",
                requirements_min_storage: "15 GB disponibles",
                requirements_rec_os: "Windows 10 64-bit",
                requirements_rec_processor: "Intel Core i5 / AMD Ryzen 5",
                requirements_rec_memory: "8 GB RAM",
                requirements_rec_graphics: "NVIDIA GTX 970 / AMD R9 290",
                requirements_rec_storage: "15 GB disponibles"
            },
            {
                title: "Assassin's Creed Odyssey",
                description: "Vive tu propia odisea en la Antigua Grecia. Explora un vasto mundo abierto, lucha en batallas épicas y toma decisiones que moldean tu destino.",
                price: 23990,
                original_price: 59990,
                discount: 60,
                rating: 4.6,
                developer_id: developerIds[3],
                release_date: '2018-10-05',
                categories: [categoryIds[3], categoryIds[1], categoryIds[15], categoryIds[0]], // RPG, Aventura, Mundo Abierto, Acción
                cover_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/812140/library_600x900.jpg",
                banner_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/812140/header.jpg",
                requirements_min_os: "Windows 7 SP1 64-bit",
                requirements_min_processor: "Intel Core i5-2400 / AMD FX-6300",
                requirements_min_memory: "8 GB RAM",
                requirements_min_graphics: "NVIDIA GTX 660 / AMD R9 285",
                requirements_min_storage: "46 GB disponibles",
                requirements_rec_os: "Windows 10 64-bit",
                requirements_rec_processor: "Intel Core i7-3770 / AMD FX-8350",
                requirements_rec_memory: "8 GB RAM",
                requirements_rec_graphics: "NVIDIA GTX 970 / AMD R9 290X",
                requirements_rec_storage: "46 GB disponibles"
            },
            {
                title: "EA Sports FC 24",
                description: "La experiencia de fútbol más realista regresa con gráficos de última generación, modos competitivos y licencias oficiales.",
                price: 44990,
                original_price: 54990,
                discount: 18,
                rating: 4.1,
                developer_id: developerIds[4],
                release_date: '2023-09-28',
                categories: [categoryIds[4], categoryIds[17]], // Deportes, Multijugador
                cover_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/2195250/library_600x900.jpg",
                banner_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/2195250/header.jpg",
                requirements_min_os: "Windows 10 - 64 bits",
                requirements_min_processor: "Intel Core i5-6600K / AMD Ryzen 5 1600",
                requirements_min_memory: "8 GB RAM",
                requirements_min_graphics: "NVIDIA GeForce GTX 1050 Ti 4GB / AMD Radeon RX 570 4 GB",
                requirements_min_storage: "100 GB disponibles",
                requirements_rec_os: "Windows 10 - 64 bits",
                requirements_rec_processor: "Intel Core i7-6700 / AMD Ryzen 7 2700X",
                requirements_rec_memory: "12 GB RAM",
                requirements_rec_graphics: "NVIDIA GeForce GTX 1660 / AMD RX 5600 XT",
                requirements_rec_storage: "100 GB disponibles"
            },
            {
                title: "Rust",
                description: "Sobrevive en un mundo hostil donde todo quiere matarte. Construye, caza, explora y defiéndete de otros jugadores en este intenso juego de supervivencia multijugador.",
                price: 19990,
                original_price: 39990,
                discount: 50,
                rating: 4.5,
                developer_id: developerIds[9],
                release_date: '2018-02-08',
                categories: [categoryIds[0], categoryIds[20], categoryIds[11], categoryIds[17]], // Acción, Supervivencia, Sandbox, Multijugador
                cover_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/library_600x900.jpg",
                banner_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
                requirements_min_os: "Windows 8.1 64-bit",
                requirements_min_processor: "Intel Core i7-3770 / AMD FX-9590",
                requirements_min_memory: "10 GB RAM",
                requirements_min_graphics: "GTX 670 2GB / AMD R9 280",
                requirements_min_storage: "25 GB disponibles",
                requirements_rec_os: "Windows 10 64-bit",
                requirements_rec_processor: "Intel Core i7-4690K / AMD Ryzen 5 1600",
                requirements_rec_memory: "16 GB RAM",
                requirements_rec_graphics: "GTX 980 / AMD R9 Fury",
                requirements_rec_storage: "25 GB disponibles"
            },
            {
                title: "Cyberpunk 2077",
                description: "Sumérgete en Night City, una megalópolis obsesionada con el poder, el glamour y la modificación corporal.",
                price: 29990,
                original_price: 54990,
                discount: 45,
                rating: 4.3,
                developer_id: developerIds[1],
                release_date: '2020-12-10',
                categories: [categoryIds[0], categoryIds[15], categoryIds[18], categoryIds[19]], // Acción, Mundo Abierto, Ciencia Ficción, Fantasía
                cover_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/library_600x900.jpg",
                banner_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
                requirements_min_os: "Windows 10 64-bit",
                requirements_min_processor: "Intel Core i7-6700 / AMD Ryzen 5 1600",
                requirements_min_memory: "12 GB RAM",
                requirements_min_graphics: "NVIDIA GeForce GTX 1060 6 GB / AMD Radeon RX 580 8 GB",
                requirements_min_storage: "70 GB SSD",
                requirements_rec_os: "Windows 10 64-bit",
                requirements_rec_processor: "Intel Core i7-12700 / AMD Ryzen 7 7800",
                requirements_rec_memory: "16 GB RAM",
                requirements_rec_graphics: "NVIDIA GeForce RTX 2060 Super / AMD Radeon RX 5700 XT",
                requirements_rec_storage: "70 GB SSD"
            },
            {
                title: "God of War",
                description: "Acompaña a Kratos y Atreus en una épica aventura nórdica llena de acción, mitología y emociones.",
                price: 34990,
                original_price: 59990,
                discount: 42,
                rating: 4.9,
                developer_id: developerIds[5],
                release_date: '2018-04-20',
                categories: [categoryIds[0]], // Acción
                cover_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/library_600x900.jpg",
                banner_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/header.jpg",
                requirements_min_os: "Windows 10 64-bit",
                requirements_min_processor: "Intel i5-2500k (4 core 3.3 GHz) / AMD Ryzen 3 1200 (4 core 3.1 GHz)",
                requirements_min_memory: "8 GB RAM",
                requirements_min_graphics: "NVIDIA GTX 960 (4 GB) / AMD R9 290X (4 GB)",
                requirements_min_storage: "70 GB disponibles",
                requirements_rec_os: "Windows 10 64-bit",
                requirements_rec_processor: "Intel i7-4770k (4 core 3.5 GHz) / AMD Ryzen 7 2700X (8 core 3.7 GHz)",
                requirements_rec_memory: "16 GB RAM",
                requirements_rec_graphics: "NVIDIA RTX 2060 (6 GB) / AMD RX 5700 XT (8 GB)",
                requirements_rec_storage: "70 GB disponibles"
            },
            {
                title: "Forza Horizon 5",
                description: "Vive la emoción de las carreras en un mundo abierto ambientado en México, con cientos de autos y eventos.",
                price: 34990,
                original_price: 59990,
                discount: 42,
                rating: 4.7,
                developer_id: developerIds[7],
                release_date: '2021-11-09',
                categories: [categoryIds[5]], // Carreras
                cover_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/library_600x900.jpg",
                banner_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/header.jpg",
                requirements_min_os: "Windows 10 version 15063.0 or higher",
                requirements_min_processor: "Intel i5-4460 / AMD Ryzen 3 1200",
                requirements_min_memory: "8 GB RAM",
                requirements_min_graphics: "NVidia GTX 970 / AMD RX 470",
                requirements_min_storage: "110 GB disponibles",
                requirements_rec_os: "Windows 10 version 15063.0 or higher",
                requirements_rec_processor: "Intel i5-8400 / AMD Ryzen 5 1500X",
                requirements_rec_memory: "16 GB RAM",
                requirements_rec_graphics: "NVidia GTX 1070 / AMD RX 590",
                requirements_rec_storage: "110 GB disponibles"
            },
            {
                title: "PUBG: BATTLEGROUNDS",
                description: "Un shooter battle royale de 100 jugadores.",
                price: 0,
                original_price: 0,
                discount: 0,
                rating: 4.3,
                developer_id: developerIds[6],
                release_date: '2017-12-21',
                categories: [categoryIds[6]], // Shooter
                cover_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/578080/library_600x900.jpg",
                banner_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg",
                requirements_min_os: "Windows 7 64-bit",
                requirements_min_processor: "Intel Core i3-4340 / AMD FX-6300",
                requirements_min_memory: "8 GB RAM",
                requirements_min_graphics: "NVIDIA GeForce GTX 660 Ti / AMD Radeon HD 7850",
                requirements_min_storage: "15 GB disponibles",
                requirements_rec_os: "Windows 7 64-bit",
                requirements_rec_processor: "Intel Core i5-4430 / AMD FX-8350",
                requirements_rec_memory: "12 GB RAM",
                requirements_rec_graphics: "NVIDIA GeForce GTX 960 / AMD Radeon R9 290",
                requirements_rec_storage: "15 GB disponibles"
            },
            {
                title: "ARK: Survival Evolved",
                description: "Un juego de supervivencia y construcción con dinosaurios.",
                price: 49990,
                original_price: 59990,
                discount: 17,
                rating: 4.7,
                developer_id: developerIds[8],
                release_date: '2017-08-08',
                categories: [categoryIds[7]], // Simulación
                cover_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/346110/library_600x900.jpg",
                banner_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/346110/header.jpg",
                requirements_min_os: "Windows 7 64-bit",
                requirements_min_processor: "Intel Core i5-2500K / AMD FX-6300",
                requirements_min_memory: "8 GB RAM",
                requirements_min_graphics: "NVIDIA GeForce GTX 660 Ti / AMD Radeon HD 7850",
                requirements_min_storage: "15 GB disponibles",
                requirements_rec_os: "Windows 10 64-bit",
                requirements_rec_processor: "Intel Core i5-4690 / AMD A10-7800",
                requirements_rec_memory: "12 GB RAM",
                requirements_rec_graphics: "NVIDIA GeForce GTX 960 / AMD Radeon R9 290",
                requirements_rec_storage: "15 GB disponibles"
            },
            {
                title: "Hogwarts Legacy",
                description: "Embárcate en una aventura mágica en el mundo de Harry Potter. Explora Hogwarts, aprende hechizos y descubre secretos ocultos en este RPG de mundo abierto.",
                price: 49990,
                original_price: 59990,
                discount: 17,
                rating: 4.6,
                developer_id: developerIds[10],
                release_date: '2023-02-10',
                categories: [categoryIds[3], categoryIds[15], categoryIds[19], categoryIds[1]], // RPG, Mundo Abierto, Fantasía, Aventura
                cover_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/990080/library_600x900.jpg",
                banner_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/990080/header.jpg",
                requirements_min_os: "Windows 10 64-bit",
                requirements_min_processor: "Intel Core i5-6600 / AMD Ryzen 5 1400",
                requirements_min_memory: "16 GB RAM",
                requirements_min_graphics: "NVIDIA GTX 960 4GB / AMD RX 470 4GB",
                requirements_min_storage: "85 GB disponibles",
                requirements_rec_os: "Windows 10 64-bit",
                requirements_rec_processor: "Intel Core i7-8700 / AMD Ryzen 5 3600",
                requirements_rec_memory: "16 GB RAM",
                requirements_rec_graphics: "NVIDIA RTX 2060 / AMD RX 6700 XT",
                requirements_rec_storage: "85 GB disponibles"
            },
            {
                title: "Dying Light 2 Stay Human",
                description: "Sobrevive en una ciudad devastada por el virus. Usa tus habilidades de parkour y combate para tomar decisiones que cambiarán el destino de la humanidad.",
                price: 34990,
                original_price: 49990,
                discount: 30,
                rating: 4.4,
                developer_id: developerIds[11],
                release_date: '2022-02-04',
                categories: [categoryIds[0], categoryIds[15], categoryIds[20], categoryIds[1]], // Acción, Mundo Abierto, Supervivencia, Aventura
                cover_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/534380/library_600x900.jpg",
                banner_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/534380/header.jpg",
                requirements_min_os: "Windows 10 64-bit",
                requirements_min_processor: "Intel Core i3-9100 / AMD Ryzen 3 2300X",
                requirements_min_memory: "8 GB RAM",
                requirements_min_graphics: "NVIDIA GTX 1050 Ti / AMD Radeon RX 560",
                requirements_min_storage: "60 GB disponibles",
                requirements_rec_os: "Windows 10 64-bit",
                requirements_rec_processor: "Intel Core i5-8600K / AMD Ryzen 5 3600X",
                requirements_rec_memory: "16 GB RAM",
                requirements_rec_graphics: "NVIDIA RTX 2060 / AMD Radeon RX 5700",
                requirements_rec_storage: "60 GB disponibles"
            },
            {
                title: "Left 4 Dead 2",
                description: "Un juego de disparos en primera persona multijugador.",
                price: 1500,
                original_price: 7500,
                discount: 80,
                rating: 4.5,
                developer_id: developerIds[6],
                release_date: '2009-11-18',
                categories: [categoryIds[6]], // Shooter
                cover_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/550/library_600x900.jpg",
                banner_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/550/header.jpg",
                requirements_min_os: "Windows 7 64-bit",
                requirements_min_processor: "Intel Core 2 Duo 2.4 GHz / AMD Athlon 64 X2 4800+",
                requirements_min_memory: "1 GB RAM",
                requirements_min_graphics: "NVIDIA GeForce 8800 GT / ATI Radeon HD 2900 XT",
                requirements_min_storage: "8 GB disponibles",
                requirements_rec_os: "Windows 7 64-bit",
                requirements_rec_processor: "Intel Core i5-2500K / AMD FX-6300",
                requirements_rec_memory: "2 GB RAM",
                requirements_rec_graphics: "NVIDIA GeForce GTX 460 / AMD Radeon HD 5850",
                requirements_rec_storage: "8 GB disponibles"
            },
            {
                title: "Sons Of The Forest",
                description: "Secuela de 'The Forest'. Enfréntate a horrores caníbales en una isla remota. Explora, construye y sobrevive con un sistema avanzado de inteligencia enemiga.",
                price: 17990,
                original_price: 29990,
                discount: 40,
                rating: 4.4,
                developer_id: developerIds[12],
                release_date: '2023-02-23',
                categories: [categoryIds[1], categoryIds[20], categoryIds[15], categoryIds[0]], // Aventura, Supervivencia, Mundo Abierto, Acción
                cover_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/1326470/library_600x900.jpg",
                banner_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/1326470/header.jpg",
                requirements_min_os: "Windows 10 64-bit",
                requirements_min_processor: "Intel Core i5-8400 / AMD Ryzen 3 3300X",
                requirements_min_memory: "12 GB RAM",
                requirements_min_graphics: "NVIDIA GTX 1060 3GB / AMD Radeon RX 570 4GB",
                requirements_min_storage: "20 GB disponibles",
                requirements_rec_os: "Windows 10 64-bit",
                requirements_rec_processor: "Intel Core i7-8700K / AMD Ryzen 5 3600X",
                requirements_rec_memory: "16 GB RAM",
                requirements_rec_graphics: "NVIDIA RTX 2070 / AMD RX 5700 XT",
                requirements_rec_storage: "20 GB disponibles"
            },
            {
                title: "Valheim",
                description: "Explora un mundo vikingo generado proceduralmente. Caza, construye y lucha por sobrevivir mientras demuestras tu valor ante Odín.",
                price: 9990,
                original_price: 19990,
                discount: 50,
                rating: 4.8,
                developer_id: developerIds[13],
                release_date: '2021-02-02',
                categories: [categoryIds[1], categoryIds[20], categoryIds[15], categoryIds[0]], // Aventura, Supervivencia, Mundo Abierto, Acción
                cover_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/892970/library_600x900.jpg",
                banner_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg",
                requirements_min_os: "Windows 7/8/10 64-bit",
                requirements_min_processor: "Dual Core 2.6 GHz",
                requirements_min_memory: "4 GB RAM",
                requirements_min_graphics: "GeForce GTX 500 / AMD equivalent",
                requirements_min_storage: "1 GB disponibles",
                requirements_rec_os: "Windows 7/8/10 64-bit",
                requirements_rec_processor: "i5 3GHz or better",
                requirements_rec_memory: "8 GB RAM",
                requirements_rec_graphics: "GeForce GTX 970 / AMD equivalent",
                requirements_rec_storage: "1 GB disponibles"
            },
        ];
        for (const juego of juegos) {
            // Insertar el juego (sin category_id)
            const res = await pool.query(`INSERT INTO games (
          title, description, price, original_price, discount, rating, developer_id, release_date,
          cover_url, banner_url, requirements_min_os, requirements_min_processor, requirements_min_memory,
          requirements_min_graphics, requirements_min_storage, requirements_rec_os, requirements_rec_processor,
          requirements_rec_memory, requirements_rec_graphics, requirements_rec_storage
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        ) RETURNING id`, [
                juego.title, juego.description, juego.price, juego.original_price, juego.discount, juego.rating,
                juego.developer_id, juego.release_date, juego.cover_url, juego.banner_url,
                juego.requirements_min_os, juego.requirements_min_processor, juego.requirements_min_memory,
                juego.requirements_min_graphics, juego.requirements_min_storage, juego.requirements_rec_os,
                juego.requirements_rec_processor, juego.requirements_rec_memory, juego.requirements_rec_graphics,
                juego.requirements_rec_storage
            ]);
            const gameId = res.rows[0].id;
            // Insertar las categorías del juego en la tabla intermedia
            for (const catId of juego.categories) {
                await pool.query('INSERT INTO game_categories (game_id, category_id) VALUES ($1, $2)', [gameId, catId]);
            }
        }
        console.log('✅ Seed completado con 20 juegos populares.');
    }
    catch (error) {
        console.error('❌ Error en el seed:', error);
    }
    finally {
        await pool.end();
    }
}
seed();
