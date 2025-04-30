"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const database_1 = require("../config/database");
const sampleGames = [
    {
        title: 'The Legend of Zelda: Breath of the Wild',
        description: 'Un juego de aventura épica en un vasto mundo abierto.',
        price: 59.99,
        original_price: 69.99,
        discount: 15,
        image_url: 'https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_auto/c_scale,w_300/v1/ncom/en_US/games/switch/t/the-legend-of-zelda-breath-of-the-wild-switch/hero',
        category: 'Aventura',
        rating: 4.9,
        developer: 'Nintendo',
        release_date: '03/03/2017',
        tags: ['Mundo abierto', 'Fantasía', 'Acción', 'Aventura'],
        requirements_min_os: 'Nintendo Switch',
        requirements_min_processor: 'NVIDIA Tegra X1',
        requirements_min_memory: '4 GB RAM',
        requirements_min_graphics: 'NVIDIA Maxwell GPU',
        requirements_min_storage: '13.4 GB',
        requirements_rec_os: 'Nintendo Switch',
        requirements_rec_processor: 'NVIDIA Tegra X1',
        requirements_rec_memory: '4 GB RAM',
        requirements_rec_graphics: 'NVIDIA Maxwell GPU',
        requirements_rec_storage: '13.4 GB'
    },
    {
        title: 'Red Dead Redemption 2',
        description: 'América, 1899. El ocaso del Salvaje Oeste ha comenzado y las fuerzas de la ley dan caza a las últimas bandas de forajidos. Los que no se rinden o sucumben, son asesinados. Tras un desastroso atraco fallido en la ciudad de Blackwater, Arthur Morgan y la banda de Van der Linde se ven obligados a huir.',
        price: 39.99,
        original_price: 59.99,
        discount: 33,
        image_url: 'https://image.api.playstation.com/vulcan/img/rnd/202009/2818/GGyEnCkaPuPNfKvIHE8QkR1I.png',
        category: 'Acción',
        rating: 4.8,
        developer: 'Rockstar Games',
        release_date: '26/10/2018',
        tags: ['Mundo abierto', 'Western', 'Historia', 'Multijugador'],
        requirements_min_os: 'Windows 7 SP1',
        requirements_min_processor: 'Intel Core i5-2500K / AMD FX-6300',
        requirements_min_memory: '8 GB RAM',
        requirements_min_graphics: 'Nvidia GeForce GTX 770 2GB / AMD Radeon R9 280 3GB',
        requirements_min_storage: '150 GB',
        requirements_rec_os: 'Windows 10',
        requirements_rec_processor: 'Intel Core i7-4770K / AMD Ryzen 5 1500X',
        requirements_rec_memory: '12 GB RAM',
        requirements_rec_graphics: 'Nvidia GeForce GTX 1060 6GB / AMD Radeon RX 480 4GB',
        requirements_rec_storage: '150 GB'
    },
    {
        title: 'FIFA 24',
        description: 'El simulador de fútbol más realista con todas las licencias oficiales.',
        price: 59.99,
        original_price: 69.99,
        discount: 15,
        image_url: 'https://image.api.playstation.com/vulcan/ap/rnd/202307/0710/60d83d435c85b7c57fe28571c0168c18c5d0f631b9819308.png',
        category: 'Deportes',
        rating: 4.2,
        developer: 'EA Sports',
        release_date: '29/09/2023',
        tags: ['Fútbol', 'Deportes', 'Multijugador', 'eSports'],
        requirements_min_os: 'Windows 10 64-bit',
        requirements_min_processor: 'Intel Core i5-6600K / AMD Ryzen 5 1600',
        requirements_min_memory: '8 GB RAM',
        requirements_min_graphics: 'NVIDIA GeForce GTX 1050 Ti / AMD Radeon RX 570',
        requirements_min_storage: '100 GB',
        requirements_rec_os: 'Windows 10 64-bit',
        requirements_rec_processor: 'Intel Core i7-8700 / AMD Ryzen 7 2700X',
        requirements_rec_memory: '12 GB RAM',
        requirements_rec_graphics: 'NVIDIA GeForce GTX 1660 / AMD RX 5600 XT',
        requirements_rec_storage: '100 GB SSD'
    },
    {
        title: 'Cyberpunk 2077',
        description: 'Un RPG de acción en un futuro distópico.',
        price: 39.99,
        image_url: 'https://image.api.playstation.com/vulcan/ap/rnd/202111/3013/cKZ4tKNFj9C00DYvVVVRRwqX.png',
        category: 'RPG'
    },
    {
        title: 'Minecraft',
        description: 'Explora mundos infinitos y construye desde sencillas casas hasta grandiosos castillos. Juega en modo creativo con recursos ilimitados o extrae en el mundo en modo supervivencia, fabricando armas y armaduras para defenderte de las criaturas peligrosas.',
        price: 19.99,
        original_price: 29.99,
        discount: 33,
        image_url: 'https://image.api.playstation.com/vulcan/img/rnd/202010/2618/8c4yS6pJ8RHHj8KvWq9Gy0iw.png',
        category: 'Sandbox',
        rating: 4.8,
        developer: 'Mojang Studios',
        release_date: '18/11/2011',
        tags: ['Sandbox', 'Supervivencia', 'Multijugador', 'Construcción'],
        requirements_min_os: 'Windows 7',
        requirements_min_processor: 'Intel Core i3-3210 / AMD A8-7600',
        requirements_min_memory: '4 GB RAM',
        requirements_min_graphics: 'Intel HD Graphics 4000 / AMD Radeon R5',
        requirements_min_storage: '4 GB',
        requirements_rec_os: 'Windows 10',
        requirements_rec_processor: 'Intel Core i5-4690 / AMD A10-7800',
        requirements_rec_memory: '8 GB RAM',
        requirements_rec_graphics: 'GeForce 700 Series / AMD Radeon Rx 200 Series',
        requirements_rec_storage: '8 GB'
    },
    {
        title: 'The Witcher 3: Wild Hunt',
        description: 'Una aventura de fantasía épica con un vasto mundo abierto.',
        price: 39.99,
        image_url: 'https://image.api.playstation.com/vulcan/img/rnd/202211/0711/S1jCzZtZwRt2Y5P9QnKg1LuN.jpg',
        category: 'RPG'
    },
    {
        title: 'God of War Ragnarök',
        description: 'Continúa la épica saga de Kratos en los reinos nórdicos.',
        price: 69.99,
        image_url: 'https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/4xJ8XB3bi888QTLZYdl7Oi0s.png',
        category: 'Acción'
    },
    {
        title: 'Assassin\'s Creed Valhalla',
        description: 'Vive la épica saga vikinga en la Inglaterra del siglo IX.',
        price: 49.99,
        image_url: 'https://image.api.playstation.com/vulcan/ap/rnd/202006/1520/EDtkdijFRwbmGKk1G9ltCQl0.png',
        category: 'Aventura'
    },
    {
        title: 'Call of Duty: Modern Warfare III',
        description: 'El shooter en primera persona más popular del mundo.',
        price: 69.99,
        image_url: 'https://image.api.playstation.com/vulcan/ap/rnd/202308/0915/d4aed48e654a00e3eb147c5c68eb3189e1ecb169bf6d6559.png',
        category: 'Shooter'
    },
    {
        title: 'Fortnite',
        description: 'El popular battle royale con construcción y eventos especiales.',
        price: 0.00,
        image_url: 'https://image.api.playstation.com/vulcan/ap/rnd/202308/1623/ba1b58343dac258bce08f35d48b4406e0225dc85b91308f4.png',
        category: 'Battle Royale'
    },
    {
        title: 'The Last of Us Part II',
        description: 'Una historia intensa de supervivencia en un mundo postapocalíptico.',
        price: 49.99,
        image_url: 'https://image.api.playstation.com/vulcan/ap/rnd/202010/0222/niMUubpU9y1PxNvYmDfb8QFD.png',
        category: 'Aventura'
    },
    {
        title: 'Horizon Forbidden West',
        description: 'Explora tierras desconocidas en esta secuela del aclamado Horizon Zero Dawn.',
        price: 59.99,
        image_url: 'https://image.api.playstation.com/vulcan/ap/rnd/202107/3100/HO8vkI9a94KmzKrMJJSz32ya.png',
        category: 'Aventura'
    },
    {
        title: 'Gran Turismo 7',
        description: 'La experiencia definitiva de simulación de conducción.',
        price: 69.99,
        image_url: 'https://image.api.playstation.com/vulcan/ap/rnd/202109/1321/yZ7dpmjtHr1olhutHT57IFRh.png',
        category: 'Carreras'
    },
    {
        title: 'Resident Evil 4 Remake',
        description: 'La reimaginación del clásico de terror y supervivencia.',
        price: 59.99,
        image_url: 'https://image.api.playstation.com/vulcan/ap/rnd/202210/0706/EVWyZD63pahuh95eKloFaJuC.png',
        category: 'Terror'
    },
    {
        title: 'Mortal Kombat 1',
        description: 'El legendario juego de lucha regresa con gráficos espectaculares.',
        price: 59.99,
        image_url: 'https://image.api.playstation.com/vulcan/ap/rnd/202305/1500/3b9f08d8cd887e4b5c566e158b8fb690fb6daf582bbb9812.png',
        category: 'Lucha'
    },
    {
        title: 'Hogwarts Legacy',
        description: 'Adéntrate en el mundo mágico de Harry Potter como nunca antes.',
        price: 49.99,
        image_url: 'https://image.api.playstation.com/vulcan/ap/rnd/202011/0919/JmxLZt5TJddyQgNvN8ptQB7o.png',
        category: 'RPG'
    },
    {
        title: 'Final Fantasy XVI',
        description: 'La nueva entrega de la legendaria saga de rol japonés.',
        price: 69.99,
        image_url: 'https://image.api.playstation.com/vulcan/ap/rnd/202211/0413/S9x7NrxJbm8CsNHVnCRlkFQy.png',
        category: 'RPG'
    },
    {
        title: 'Diablo IV',
        description: 'El regreso de la oscura saga de acción y rol.',
        price: 59.99,
        image_url: 'https://blz-contentstack-images.akamaized.net/v3/assets/blt77f4425de611b362/blt6d7b0fd8453e72b9/646e720a71dda2d35869ba4b/d4-open-graph.jpg',
        category: 'RPG'
    },
    {
        title: 'Elden Ring',
        description: 'Un vasto mundo lleno de emoción y aventura te espera en Elden Ring, la nueva fantasía de acción y rol creada por FromSoftware Inc. y BANDAI NAMCO Entertainment Inc. En las Tierras Intermedias gobernadas por la Reina Márika la Eterna, el Círculo de Elden, origen del Árbol Áureo, ha sido destruido.',
        price: 47.99,
        original_price: 59.99,
        discount: 20,
        image_url: 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/phvVT0qZfcRms5qDAk0SI3CM.png',
        category: 'RPG',
        rating: 4.9,
        developer: 'FromSoftware',
        release_date: '25/02/2022',
        tags: ['Mundo abierto', 'Souls-like', 'Fantasía', 'Difícil'],
        requirements_min_os: 'Windows 10',
        requirements_min_processor: 'INTEL CORE I5-8400 or AMD RYZEN 3 3300X',
        requirements_min_memory: '12 GB RAM',
        requirements_min_graphics: 'NVIDIA GEFORCE GTX 1060 3 GB or AMD RADEON RX 580 4 GB',
        requirements_min_storage: '60 GB',
        requirements_rec_os: 'Windows 11',
        requirements_rec_processor: 'INTEL CORE I7-8700K or AMD RYZEN 5 3600X',
        requirements_rec_memory: '16 GB RAM',
        requirements_rec_graphics: 'NVIDIA GEFORCE GTX 1070 8 GB or AMD RADEON RX VEGA 56 8 GB',
        requirements_rec_storage: '60 GB SSD'
    },
    {
        title: 'Spider-Man 2',
        description: 'La nueva aventura del Hombre Araña en Nueva York.',
        price: 69.99,
        image_url: 'https://image.api.playstation.com/vulcan/ap/rnd/202306/1219/1c3d075a45bcf517ea6a5ead3bc54d950aac38a5e7ea539a.png',
        category: 'Acción'
    }
];
const seedDatabase = async () => {
    try {
        // Eliminamos los datos existentes de los juegos para evitar duplicaciones
        await database_1.pool.query('TRUNCATE TABLE games RESTART IDENTITY CASCADE');
        for (const game of sampleGames) {
            await database_1.pool.query(`INSERT INTO games (
          title, description, price, original_price, discount, image_url, 
          category, rating, developer, release_date, tags,
          requirements_min_os, requirements_min_processor, requirements_min_memory, 
          requirements_min_graphics, requirements_min_storage,
          requirements_rec_os, requirements_rec_processor, requirements_rec_memory, 
          requirements_rec_graphics, requirements_rec_storage
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
        )`, [
                game.title, game.description, game.price, game.original_price, game.discount, game.image_url,
                game.category, game.rating, game.developer, game.release_date, game.tags,
                game.requirements_min_os, game.requirements_min_processor, game.requirements_min_memory,
                game.requirements_min_graphics, game.requirements_min_storage,
                game.requirements_rec_os, game.requirements_rec_processor, game.requirements_rec_memory,
                game.requirements_rec_graphics, game.requirements_rec_storage
            ]);
        }
        console.log('✅ Datos de prueba insertados correctamente');
        return true;
    }
    catch (error) {
        console.error('❌ Error al insertar datos de prueba:', error);
        return false;
    }
};
exports.seedDatabase = seedDatabase;
// Si este archivo se ejecuta directamente, poblar la base de datos
if (require.main === module) {
    (0, exports.seedDatabase)();
}
