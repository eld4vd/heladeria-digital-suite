import { motion } from 'framer-motion';
import { useMemo } from 'react';

// Variantes de animación para el helado
const iceCreamVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 30
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotate: 0,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const
    }
  },
  hover: {
    scale: 1.1,
    rotate: [0, -10, 10, -10, 0],
    transition: {
      duration: 0.5
    }
  }
};

// Animación de "derretimiento" sutil
const meltAnimation = {
  y: [0, 5, 0],
  scaleY: [1, 0.98, 1],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut" as const,
    repeatType: "loop" as const
  }
};

// Partículas/estrellas que aparecen
const sparkleVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: (i: number) => ({
    opacity: [0, 1, 0],
    scale: [0, 1, 0],
    transition: {
      duration: 1.5,
      delay: i * 0.2,
      repeat: Infinity,
      repeatDelay: 2,
      repeatType: "loop" as const
    }
  })
};

// Pre-calcular posiciones de partículas (solo 1 vez)
const sparklePositions = Array.from({ length: 5 }, (_, i) => {
  const angle = (i * 360) / 5;
  return {
    x: Math.cos((angle * Math.PI) / 180) * 200,
    y: Math.sin((angle * Math.PI) / 180) * 200
  };
});

interface Section {
  title: string;
  description: string;
  iceCream: string;
  gradient: string;
  sparkleColor: string;
}

const sections: Section[] = [
  {
    title: 'Sabores Artesanales',
    description: 'Cada helado es elaborado a mano con ingredientes premium y recetas tradicionales italianas.',
    iceCream: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&q=80',
    gradient: 'from-pink-500 to-rose-500',
    sparkleColor: '#ec4899'
  },
  {
    title: 'Ingredientes Naturales',
    description: 'Utilizamos frutas frescas de temporada y productos locales sin conservantes artificiales.',
    iceCream: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=300&q=80',
    gradient: 'from-amber-500 to-orange-500',
    sparkleColor: '#f59e0b'
  },
  {
    title: 'Experiencia Premium',
    description: 'Desde 2018, creando momentos memorables con cada cucharada de nuestro gelato.',
    iceCream: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=300&q=80',
    gradient: 'from-cyan-500 to-blue-500',
    sparkleColor: '#06b6d4'
  }
];

const ScrollingIceCream = () => {
  // Memoizar variantes de texto para evitar recreaciones
  const textVariants = useMemo(() => ({
    title: {
      hidden: { opacity: 0, y: 15 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { delay: 0.1, duration: 0.25 }
      }
    },
    description: {
      hidden: { opacity: 0, y: 15 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { delay: 0.15, duration: 0.25 }
      }
    }
  }), []);

  return (
    <div className="bg-gradient-to-b from-white via-slate-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {sections.map((section, index) => (
          <motion.div
            key={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2, margin: "0px 0px -200px 0px" }}
            className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20 mb-32 last:mb-0`}
          >
            {/* Helado animado */}
            <motion.div 
              className="flex-1 flex justify-center items-center relative"
              variants={iceCreamVariants}
            >
              <motion.div
                whileHover="hover"
                variants={iceCreamVariants}
                className="relative cursor-pointer"
              >
                {/* Círculo de fondo con gradiente */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${section.gradient} rounded-full blur-3xl opacity-30`}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Imagen del helado */}
                <motion.div
                  animate={meltAnimation}
                  className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full overflow-hidden border-8 border-white shadow-2xl"
                >
                  <img
                    src={section.iceCream}
                    alt={section.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.div>

                {/* Partículas brillantes alrededor */}
                {sparklePositions.map((pos, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={sparkleVariants}
                    initial="hidden"
                    animate="visible"
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      left: `calc(50% + ${pos.x}px)`,
                      top: `calc(50% + ${pos.y}px)`,
                      backgroundColor: section.sparkleColor
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>

            {/* Contenido de texto */}
            <motion.div
              className="flex-1 text-center lg:text-left"
              variants={{
                hidden: { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
                visible: { 
                  opacity: 1, 
                  x: 0,
                  transition: {
                    duration: 0.8,
                    delay: 0.3
                  }
                }
              }}
            >
              <motion.h2 
                className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r ${section.gradient} bg-clip-text text-transparent`}
                variants={textVariants.title}
              >
                {section.title}
              </motion.h2>
              <motion.p 
                className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl"
                variants={textVariants.description}
              >
                {section.description}
              </motion.p>
              
              {/* Línea decorativa animada */}
              <motion.div
                className={`h-1 bg-gradient-to-r ${section.gradient} rounded-full mt-6`}
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, duration: 0.8 }}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ScrollingIceCream;
