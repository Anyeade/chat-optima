'use client'

import { useCallback, useEffect, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { Container, Engine } from '@tsparticles/engine'
import type { ISourceOptions } from '@tsparticles/engine'

export function HeroParticles() {
  const [init, setInit] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

  const particlesLoaded = useCallback(async (container?: Container) => {
    if (container) {
      console.log(container)
    }
  }, [])

  const options: ISourceOptions = {
    background: {
      color: 'transparent'
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'connect'
        }
      },
      modes: {
        connect: {
          distance: 200,
          links: {
            opacity: 0.5
          },
          radius: 150
        }
      }
    },
    particles: {
      color: {
        value: ['#58a6ff', '#1f6feb', '#238636']
      },
      links: {
        color: '#58a6ff',
        distance: 100,
        enable: true,
        opacity: 0.6,
        width: 1,
        triangles: {
          enable: true,
          color: '#1f6feb',
          opacity: 0.3
        }
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: {
          default: 'bounce'
        },
        random: true,
        speed: 2,
        straight: false,
      },
      number: {
        density: {
          enable: true
        },
        value: 150
      },
      opacity: {
        value: 0.7
      },
      shape: {
        type: ['circle', 'triangle', 'polygon']
      },
      size: {
        value: { min: 1, max: 3 }
      },
      wobble: {
        enable: true,
        distance: 10,
        speed: 0.5
      }
    },
    detectRetina: true
  }

  return (
    <div className="fixed inset-0 bg-transparent z-10 pointer-events-none">
      {init && (
        <Particles
          id="hero-particles"
          particlesLoaded={particlesLoaded}
          options={options}
        />
      )}
    </div>
  )
}
