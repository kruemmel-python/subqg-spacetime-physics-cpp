# SubQG Physics Engine – Universeller API & Integrations-Guide
**Verbindung mit Unreal Engine 5, Blender 3.x/4.x und eigenen Game Engines**

---

## 1. System- & Architekturübersicht

Die **SubQG Physics Engine** basiert auf dem relationalen Subquantum-Graphity-Metrikgitter (100% First-Principles, 0 Kontakt-Impulssolver). Um die Engine universell in externen 3D-Engines, DCC-Tools und eigenen Rendering-Pipelines nutzbar zu machen, stellt sie einen extrem performanten, plattformunabhängigen **Live-Physik-Server** bereit.

```
+-------------------------------------------------------------------------+
|                  SubQG Physics Engine (Node.js Server)                  |
|  - Relationales Metrikgitter (Wirkungsvariation)                        |
|  - Kantenbarriere-Repulsion & Relationale Scherdämpfung                 |
|  - Kontinuierliche Gelenkbindungen & SubQG Materialbruch (Destruction)  |
+------------------------------------+------------------------------------+
                                     |
              +----------------------+----------------------+
              |                                             |
   [TCP Socket Stream: Port 3001]                [HTTP JSON-RPC: Port 3002]
   - Framed NDJSON (60 - 120 Hz)                 - REST API & Batch Baking
   - Latenz < 0.5 ms                             - Offline Keyframe-Export
              |                                             |
   +----------+-----------+                      +----------+-----------+
   |                      |                      |                      |
   v                      v                      v                      v
Unreal Engine 5       Custom C++            Blender 3.x/4.x        Web / Tools
(C++ / Blueprints)    Game Engines          (Python Addon)         (REST Clients)
```

### Server starten
Im Verzeichnis `game_physic_engine`:
```bash
npm run server
# oder: node tools/start_physics_server.mjs
```
Standard-Ports:
* **TCP Port 3001:** Echtzeit-Streaming für Unreal Engine, eigene Game Engines und interaktive Viewports.
* **HTTP Port 3002:** REST API und Batch Baking für Animations-Keyframes in Blender.

---

## 2. Unreal Engine 5 Integration (C++ & Blueprints)

### Schritt 1: Header und Source in das Unreal-Projekt kopieren
Kopiere die beiden Integrationsdateien in das `Source/<DeinProjekt>/`-Verzeichnis:
* `integrations/unreal/SubQGUnrealBridge.h`
* `integrations/unreal/SubQGUnrealBridge.cpp`

### Schritt 2: Module in `DeinProjekt.Build.cs` aktivieren
Füge `Sockets`, `Networking` und `Json` zu den `PublicDependencyModuleNames` hinzu:
```csharp
PublicDependencyModuleNames.AddRange(new string[] { 
    "Core", 
    "CoreUObject", 
    "Engine", 
    "InputCore", 
    "Sockets", 
    "Networking", 
    "Json", 
    "JsonUtilities" 
});
```

### Schritt 3: Koordinaten-Mapping (Meters zu Zentimetern)
Unreal Engine arbeitet in Zentimetern (Z nach oben), während SubQG in physikalischen SI-Metern rechnet:
$$\vec{X}_{\text{UE}} = x_{\text{SubQG}} \cdot 100 \quad [\text{cm}]$$
$$\vec{Z}_{\text{UE}} = y_{\text{SubQG}} \cdot 100 \quad [\text{cm}]$$
$$\text{Pitch}_{\text{UE}} = -\theta_{\text{SubQG}} \cdot \frac{180}{\pi} \quad [^\circ]$$

### Schritt 4: Blueprint-Nutzung
1. **World Subsystem abrufen:** `Get SubQGPhysicsSubsystem`
2. **Verbinden:** Node `Connect To SubQG Server` (Host: `127.0.0.1`, Port: `3001`) aufrufen (z.B. in `BeginPlay`).
3. **Actor registrieren:** Rufe `Register Actor Binding` auf, um einen Unreal Actor mit einer SubQG Body-ID zu verknüpfen.
4. **Körper erzeugen:** `Spawn SubQG Box` oder `Spawn SubQG Sphere`.
5. **Zerstörungs-Events abfangen:** Binde an das Delegate `OnSubQGFracture`. Wenn eine Planke oder ein Felsen zerbricht, liefert das Event die genaue Bruchposition im Unreal-Raum – ideal, um ein **Niagara-Partikelsystem** (Holzsplitter, Steinstaub) oder einen **Chaos Geometry Collection**-Spawn auszulösen!

---

## 3. Blender 3.x / 4.x Integration (Python Addon & Keyframe Baking)

Mit der Blender-Integration kannst du komplexe SubQG-Kollisionen, elastische Stöße, Gelenkketten und Materialbrüche direkt mit einem Klick in photorealistische Blender-Animationen backen.

### Schritt 1: Skript in Blender laden
1. Starte den SubQG Server: `npm run server`
2. Öffne Blender (3.6 LTS, 4.0, 4.1 oder neuer).
3. Wechsle in den Arbeitsbereich **Scripting** -> erstelle ein neues Textdokument.
4. Öffne oder füge den Inhalt von `integrations/blender/subqg_blender_bridge.py` ein.
5. Klicke auf **Run Script** (oder installiere es als Addon über `Edit > Preferences > Add-ons > Install`).

### Schritt 2: Live-Nutzung im 3D-Viewport
1. Drücke im 3D-Viewport die Taste `N`, um das Sidebar-Panel zu öffnen.
2. Wechsle auf den Reiter **SubQG Physics**.
3. Klicke auf **Mit SubQG Server verbinden**.
4. Wähle die gewünschten Meshes in der Szene aus (z.B. einen Kistenturm und einen fallenden Fels).
5. Klicke auf **In Keyframes backen**:
   * Das Addon serialisiert die Geometrie der ausgewählten Objekte an SubQG.
   * Die SubQG-Engine berechnet die Kantenbarriere-Repulsionen und Bruchtrennungen.
   * Alle Translations- und Rotationswerte werden Frame für Frame in die Animationskurven der Blender-Objekte geschrieben!
6. Drücke die Leertaste in Blender – die Physik läuft mit voller Frame-Rate ab und kann sofort gerendert werden (Cycles / Eevee).

---

## 4. Eigene Game Engines (C++ / Python / Rust / Godot)

### A. Eigene C++ Game Engine (Header-Only `SubQGClient.hpp`)
Das Header-Only Interface benötigt keine externen Bibliotheken und funktioniert sofort unter Windows (Winsock2) und Linux/macOS (POSIX):

```cpp
#include "integrations/custom_engine/SubQGClient.hpp"

int main() {
    SubQG::Client physics;

    // 1. Verbinde mit dem lokalen SubQG Physics Server
    if (!physics.connect("127.0.0.1", 3001)) {
        std::cerr << "SubQG Server nicht erreichbar!" << std::endl;
        return 1;
    }

    // 2. Welt im Pure-SubQG Modus initialisieren (First-Principles)
    physics.createWorld("pure-subqg", 0.0f, -9.81f);

    // 3. Statischen Boden und dynamische Kiste erzeugen
    physics.createBox("ground", 0.0f, 0.0f, 40.0f, 1.0f, false);
    physics.createBox("crate_1", 0.0f, 8.0f, 1.2f, 1.2f, true, true, 300.0f);

    // 4. Game Loop (60 FPS)
    while (true) {
        // Simulationsschritt (dt = 1/60s)
        SubQG::WorldSnapshot snap = physics.step(1.0f / 60.0f);

        for (const auto& body : snap.bodies) {
            // Rendere Objekt an Position (body.x, body.y) mit Rotation body.angleDeg
            std::cout << body.id << " -> X: " << body.x << " | Y: " << body.y << "\n";
        }
    }

    return 0;
}
```

### B. Eigene Python Engine (Pygame, Ursina, Arcade, Godot)
Verwende das zero-dependency Skript `integrations/custom_engine/subqg_client.py`:

```python
from subqg_client import SubQGClient

client = SubQGClient("127.0.0.1", 3001)
client.connect()

# Welt aufbauen
client.create_world("pure-subqg", (0, -9.81))
client.create_box("floor", 0, 0, 50, 1.0, is_dynamic=False)
client.create_circle("ball", 0, 10, 0.5, is_dynamic=True)

# Gameloop
def update():
    state = client.step(1.0 / 60.0)
    for b in state["bodies"]:
        my_engine_set_transform(b["id"], b["x"], b["y"], b["angle"])
```

---

## 5. Vollständige JSON-RPC API Referenz

Alle Befehle können sowohl als Line-Delimited JSON über **TCP (Port 3001)** als auch per HTTP POST an `/api/rpc` an **HTTP (Port 3002)** gesendet werden.

| Methode | Parameter | Beschreibung |
|---|---|---|
| `create_world` | `engineMode` ("pure-subqg"\|"hybrid"), `gravity` [gx, gy], `enableSubQGLattice` (bool) | Erzeugt eine frische SubQG-Simulationswelt. |
| `load_scene` | `scene` ("ropeBridge", "ropeBridgeBreakable", "vehicleTerrain", "catapult") | Lädt eine vordefinierte Test- und Demoszene. |
| `create_box` | `id`, `x`, `y`, `width`, `height`, `type`, `density`, `friction`, `isDestructible`, `fractureForce` | Erzeugt einen rechteckigen Rigid Body. |
| `create_circle` | `id`, `x`, `y`, `radius`, `type`, `density`, `friction`, `isDestructible`, `fractureForce` | Erzeugt einen kreisförmigen Rigid Body. |
| `create_capsule`| `id`, `x`, `y`, `length`, `radius`, `type` | Erzeugt eine Kapsel. |
| `create_segment`| `id`, `x1`, `y1`, `x2`, `y2`, `friction` | Erzeugt ein statisches Liniensegment (z.B. Gelände). |
| `create_joint`  | `type` ("revolute"\|"distance"\|"weld"), `bodyA`, `bodyB`, `anchorX`, `anchorY`, `breakingForce` | Erzeugt eine topologische Gelenkverbindung mit optionaler Bruchlast. |
| `step`          | `dt` (Sekunden, z.B. 0.01666) | Führt einen Simulationsschritt aus und gibt den neuen Zustand zurück. |
| `get_state`     | *(keine)* | Liefert die aktuellen Posen, Geschwindigkeiten und Energiewerte aller Körper. |
| `apply_force`   | `id`, `fx`, `fy`, `px` (opt), `py` (opt) | Übt eine kontinuierliche Kraft (Newton) auf einen Körper aus. |
| `apply_impulse` | `id`, `ix`, `iy`, `px` (opt), `py` (opt) | Übt einen Sofortimpuls (N·s) auf einen Körper aus. |
| `raycast`       | `origin` [x, y], `direction` [dx, dy], `maxDistance` | Führt einen präzisen Laser-/Sichtlinien-Test durch. |
| `bake`          | `steps` (Anzahl Frames), `dt` | Backt die gesamte Simulation in ein Array von Snapshots (ideal für Blender). |
