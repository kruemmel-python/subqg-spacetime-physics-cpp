import { Vec2, Material, Polygon } from '../index.mjs';

/**
 * Demo-Szenen für das interaktive Physik-Labor
 */
export const DemoScenes = {
  // Szene 1: Kistenturm & Stapeln
  stackingTower(world) {
    // Boden
    world.createBox(0, 0, 40, 1.0, {
      type: 'static',
      material: new Material({ friction: 0.6, restitution: 0.0 })
    });

    // 8 Kisten übereinander gestapelt
    for (let i = 0; i < 8; i++) {
      world.createBox(0, 1.0 + i * 1.05, 1.0, 1.0, {
        type: 'dynamic',
        material: new Material({ friction: 0.6, restitution: 0.05 }),
        linearDamping: 0.05,
        angularDamping: 0.05
      });
    }

    // Zusätzliche Kistenpyramide links
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4 - row; col++) {
        const x = -8 + col * 1.1 + row * 0.55;
        const y = 1.0 + row * 1.05;
        world.createBox(x, y, 1.0, 1.0, {
          type: 'dynamic',
          material: new Material({ friction: 0.5, restitution: 0.1 })
        });
      }
    }
  },

  // Szene 2: Springende Bälle & Murmelbahn
  bouncingBalls(world) {
    // Geneigte Rampen (Segmente / Boxen)
    world.createBox(-5, 8, 12, 0.4, {
      type: 'static',
      angle: -0.3,
      material: new Material({ friction: 0.05, restitution: 0.7 })
    });

    world.createBox(5, 5, 12, 0.4, {
      type: 'static',
      angle: 0.3,
      material: new Material({ friction: 0.05, restitution: 0.7 })
    });

    world.createBox(0, 0, 30, 1.0, {
      type: 'static',
      material: new Material({ friction: 0.2, restitution: 0.8 })
    });

    // Bälle mit unterschiedlichen Farben und Elastizitäten
    for (let i = 0; i < 12; i++) {
      const x = -9 + (i % 4) * 0.8 + Math.random() * 0.2;
      const y = 12 + Math.floor(i / 4) * 1.2;
      world.createCircle(x, y, 0.3 + Math.random() * 0.2, {
        type: 'dynamic',
        material: new Material({
          density: 1.0,
          friction: 0.1,
          restitution: 0.6 + Math.random() * 0.35
        })
      });
    }
  },

  // Szene 3: Seilbrücke / Hängebrücke
  ropeBridge(world, options = {}) {
    world.createBox(0, 0, 40, 1.0, { type: 'static' });

    // Belastungsgrenze: Bei Materialbruch-Modus brechen Gelenke bei 250 N
    const breakable = options.breakable ?? false;
    const breakingForce = breakable ? (options.breakingForce ?? 250) : Infinity;

    // Zwei Pfeiler
    const p1 = world.createBox(-8, 5, 1.5, 4, { type: 'static' });
    const p2 = world.createBox(8, 5, 1.5, 4, { type: 'static' });

    // 12 Brückensegmente
    const segments = [];
    let prev = p1;
    let prevAnchor = new Vec2(-7.25, 6.8);

    for (let i = 0; i < 12; i++) {
      const x = -6.5 + i * 1.18;
      const sag = 0.5 * (1.0 - (x / 7.0) * (x / 7.0));
      const y = 6.5 - Math.max(0, sag);
      const plank = world.createBox(x, y, 1.1, 0.2, {
        type: 'dynamic',
        isDestructible: breakable,
        fractureForce: 350.0,
        linearDamping: 0.2,
        angularDamping: 0.4,
        material: new Material({ density: 1.2, friction: 0.6, restitution: 0.05 })
      });
      segments.push(plank);

      const anchor = new Vec2(x - 0.55, y);
      world.createRevoluteJoint(prev, plank, anchor, { breakingForce });
      prev = plank;
      prevAnchor = new Vec2(x + 0.55, y);
    }

    world.createRevoluteJoint(prev, p2, new Vec2(7.25, 6.8), { breakingForce });

    // Schwerer Stein fällt auf die Brücke
    world.createCircle(0, 12, 0.8, {
      type: 'dynamic',
      userData: 'Felsblock',
      material: new Material({ density: 4.0, friction: 0.5, restitution: 0.1 })
    });
  },

  // Szene 3b: Zerstörbare Hängebrücke (Materialbruch bei 250 N Belastung)
  ropeBridgeBreakable(world) {
    this.ropeBridge(world, { breakable: true, breakingForce: 250 });
  },

  // Szene 4: Motorisiertes Geländefahrzeug
  vehicleTerrain(world) {
    // Hügelige Landschaft (Kette aus Segmenten)
    const points = [
      [-20, 3], [-10, 0.5], [0, 0], [10, 1.5], [18, 0.5], [25, 3], [35, 0]
    ];
    for (let i = 0; i < points.length - 1; i++) {
      world.createSegment(points[i][0], points[i][1], points[i+1][0], points[i+1][1], {
        type: 'static',
        material: new Material({ friction: 0.9 })
      });
    }

    // Hangneigung am Startpunkt x = -13:
    // Zwischen [-20, 3] und [-10, 0.5] beträgt der Neigungswinkel atan2(-2.5, 10) = -0.245 rad (~ -14°)
    const slopeAngle = -0.245;
    const cosA = Math.cos(slopeAngle);
    const sinA = Math.sin(slopeAngle);

    // Fahrgestell: Tiefer Schwerpunkt, solider Radstand, Hang-angepasster Startwinkel
    const chassis = world.createBox(-13.0, 1.85, 3.8, 0.4, {
      type: 'dynamic',
      angle: slopeAngle,
      linearDamping: 0.1,
      angularDamping: 1.5,
      material: new Material({ density: 5.0, friction: 0.4 })
    });

    // Räder: Hohe Bodenhaftung und weiche Landung (restitution 0.0 verhindert Trampolin-Effekt)
    const wheelMat = new Material({ density: 1.5, friction: 1.0, restitution: 0.0 });
    const rearPos = new Vec2(-13.0 - 1.5 * cosA, 1.85 - 1.5 * sinA);
    const frontPos = new Vec2(-13.0 + 1.5 * cosA, 1.85 + 1.5 * sinA);
    const rear = world.createCircle(rearPos.x, rearPos.y, 0.55, { type: 'dynamic', material: wheelMat });
    const front = world.createCircle(frontPos.x, frontPos.y, 0.55, { type: 'dynamic', material: wheelMat });

    // Anti-Wheelie Allradantrieb mit Front-Zugkraft:
    // Der Frontmotor zieht das Fahrzeug aktiv vorwärts und abwärts an den Hang,
    // während der Heckmotor mit reduzierter Kraft sanft unterstützt, ohne die Nase aufzubäumen.
    world.createRevoluteJoint(chassis, rear, rearPos, {
      enableMotor: true,
      motorSpeed: -12.0,
      maxMotorTorque: 6.0
    });
    world.createRevoluteJoint(chassis, front, frontPos, {
      enableMotor: true,
      motorSpeed: -12.0,
      maxMotorTorque: 28.0
    });
  },

  // Szene 5: Katapult & Trebuchet (Verschiebbar & Manuell auslösbar)
  catapult(world) {
    world.createBox(0, 0, 80, 1.0, { type: 'static' });

    // Verschiebbares Katapult-Fahrgestell (Dynamic, mit der Maus greif- und verschiebbar!)
    const base = world.createBox(-12.0, 1.6, 3.2, 2.0, {
      type: 'dynamic',
      linearDamping: 0.3,
      angularDamping: 1.0,
      userData: 'Katapult-Fahrgestell (Verschiebbar)',
      material: new Material({ density: 10.0, friction: 0.9 })
    });
    base.invInertia = 0; // Fixierte Rotation: Steht beim Abfeuern stabil, kann horizontal frei verschoben werden

    // Wurfarm: Drehpunkt bei (-12.0, 2.4), zeigt in Ladestellung nach links
    const arm = world.createBox(-14.5, 2.4, 5.0, 0.35, {
      type: 'dynamic',
      userData: 'Katapult-Arm',
      material: new Material({ density: 1.0, friction: 0.4 })
    });

    // Wurfschale (Cup) am Hebelende
    const cup = world.createBox(-16.9, 2.8, 0.4, 0.8, {
      type: 'dynamic',
      userData: 'Katapult-Schale',
      material: new Material({ density: 0.8, friction: 0.2 })
    });
    world.createWeldJoint(arm, cup, new Vec2(-16.9, 2.4));

    // Gelenk mit Torsionsantrieb: Initial AUS (manuell startbar!)
    const catapultJoint = world.createRevoluteJoint(base, arm, new Vec2(-12.0, 2.4), {
      enableMotor: false,
      motorSpeed: -16.0,
      maxMotorTorque: 3500.0,
      enableLimit: true,
      lowerAngle: -Math.PI * 0.75, // ~ -135° Schlägt bei 45° nach rechts an
      upperAngle: Math.PI * 0.1
    });

    // Projektil (Schwerer Felsblock, zerstörbar bei Aufprall!)
    world.createCircle(-16.3, 3.1, 0.45, {
      type: 'dynamic',
      isDestructible: true,
      fractureForce: 400.0,
      userData: 'Felsblock',
      material: new Material({ density: 4.5, friction: 0.2, restitution: 0.15 })
    });

    // Treibgut / Zielmauer aus zerstörbaren Kisten bei x = 8..11
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 3; c++) {
        world.createBox(8.0 + c * 0.8, 0.9 + r * 0.8, 0.7, 0.7, {
          type: 'dynamic',
          isDestructible: true,
          fractureForce: 130.0,
          material: new Material({ density: 1.0, friction: 0.6, restitution: 0.05 })
        });
      }
    }

    // Katapult-Steuerung für manuelle Auslösung
    world.catapultController = {
      joint: catapultJoint,
      arm: arm,
      base: base,
      cup: cup,
      isFired: false,
      fire() {
        catapultJoint.enableMotor = true;
        catapultJoint.motorSpeed = -16.0;
        catapultJoint.maxMotorTorque = 3500.0;
        this.isFired = true;
      },
      reload() {
        catapultJoint.enableMotor = true;
        catapultJoint.motorSpeed = 6.0;
        catapultJoint.maxMotorTorque = 600.0;
        setTimeout(() => {
          catapultJoint.enableMotor = false;
          this.isFired = false;
          // Neues Projektil in die Wurfschale legen
          world.createCircle(base.position.x - 4.3, base.position.y + 1.4, 0.45, {
            type: 'dynamic',
            isDestructible: true,
            fractureForce: 400.0,
            userData: 'Felsblock',
            material: new Material({ density: 4.5, friction: 0.2, restitution: 0.15 })
          });
        }, 600);
      }
    };
  },

  // Szene 6: Sensor-Radar & Triggers
  sensorsAndTrays(world) {
    world.createBox(0, 0, 40, 1.0, { type: 'static' });

    // Ein Durchgang mit Trigger-Feld
    world.createBox(-2, 4, 1.5, 4, { type: 'static' });
    world.createBox(2, 4, 1.5, 4, { type: 'static' });

    // Sensor-Tor in der Mitte
    const trigger = world.createBox(0, 4, 2.5, 4.0, {
      type: 'static',
      isTrigger: true,
      userData: { name: 'GateSensor' }
    });

    // Periodisch Bälle durchrollen lassen
    for (let i = 0; i < 5; i++) {
      const b = world.createCircle(-8 - i * 1.5, 2.0, 0.4, {
        type: 'dynamic',
        material: new Material({ friction: 0.1, restitution: 0.5 })
      });
      b.setVelocity(5.0, 0); // Rollen nach rechts durch das Tor
    }
  }
};
