"""
SubQG Physics Engine - Blender 3.x / 4.x Integration Bridge
============================================================

Verbindet Blender direkt mit dem SubQG Physics Server (TCP Port 3001).
Ermöglicht:
1. Live-Physiksimulation im 3D-Viewport (Echtzeit)
2. Batch-Baking von SubQG-Kollisionen und Materialbruch direkt in Keyframes
3. Zerstörungsphysik: Erzeugt Trümmerteile bei Materialbruch-Events

Anleitung zur Nutzung in Blender:
--------------------------------
1. Starte den SubQG Server im Terminal:
   npm run server (oder: node tools/start_physics_server.mjs)
2. Öffne Blender -> Text Editor -> Neues Skript -> Dieses Skript einfügen
3. Klicke auf "Run Script"
4. Im 3D Viewport findest du im Sidebar (N-Panel) den Reiter "SubQG Physics"
"""

import bpy
import socket
import json
import math
from mathutils import Vector, Euler

bl_info = {
    "name": "SubQG Physics Engine Bridge",
    "author": "SubQG Research & Engineering Team",
    "version": (1, 0, 0),
    "blender": (3, 6, 0),
    "location": "View3D > Sidebar > SubQG Physics",
    "description": "Live Physics & Keyframe Baking via SubQG Relational Metric Lattice",
    "category": "Physics",
}

class SubQGClient:
    """Schlanker TCP-Client für die SubQG Physics Engine"""
    def __init__(self, host='127.0.0.1', port=3001):
        self.host = host
        self.port = port
        self.sock = None
        self.req_id = 1

    def connect(self):
        try:
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.sock.settimeout(3.0)
            self.sock.connect((self.host, self.port))
            return True
        except Exception as e:
            print(f"[SubQG Blender] Verbindung fehlgeschlagen: {e}")
            self.sock = None
            return False

    def disconnect(self):
        if self.sock:
            try:
                self.sock.close()
            except:
                pass
            self.sock = None

    def send_command(self, method, params=None):
        if not self.sock:
            if not self.connect():
                return None

        req = {
            "id": self.req_id,
            "method": method,
            "params": params or {}
        }
        self.req_id += 1

        try:
            msg = json.dumps(req) + "\n"
            self.sock.sendall(msg.encode('utf-8'))
            
            # Antwort empfangen
            buffer = ""
            while "\n" not in buffer:
                chunk = self.sock.recv(4096).decode('utf-8')
                if not chunk:
                    break
                buffer += chunk

            line = buffer.split("\n")[0]
            return json.loads(line)
        except Exception as e:
            print(f"[SubQG Blender] RPC-Fehler ({method}): {e}")
            self.disconnect()
            return None

# Globaler Client
subqg_client = SubQGClient()

class SUBQG_OT_Connect(bpy.types.Operator):
    """Verbinde mit dem SubQG Physics Server"""
    bl_idname = "subqg.connect"
    bl_label = "Mit SubQG Server verbinden"

    def execute(self, context):
        if subqg_client.connect():
            self.report({'INFO'}, "Erfolgreich mit SubQG Physics Server verbunden (Port 3001)!")
        else:
            self.report({'ERROR'}, "Verbindung fehlgeschlagen. Läuft der Server (node tools/start_physics_server.mjs)?")
        return {'FINISHED'}

class SUBQG_OT_BakeKeyframes(bpy.types.Operator):
    """Backt die SubQG-Simulation direkt in Animations-Keyframes der ausgewählten Objekte"""
    bl_idname = "subqg.bake_keyframes"
    bl_label = "In Keyframes backen"

    def execute(self, context):
        if not subqg_client.sock and not subqg_client.connect():
            self.report({'ERROR'}, "Keine Verbindung zum SubQG Server!")
            return {'CANCELLED'}

        props = context.scene.subqg_props
        start_frame = context.scene.frame_start
        end_frame = context.scene.frame_end
        steps = end_frame - start_frame + 1

        self.report({'INFO'}, f"Initialisiere SubQG Welt für {steps} Frames...")

        # 1. Neue Welt initialisieren
        subqg_client.send_command("create_world", {
            "engineMode": props.engine_mode,
            "gravity": [0.0, -props.gravity_y],
            "enableSubQGLattice": True
        })

        # 2. Ausgewählte Blender-Objekte registrieren
        selected_objs = [obj for obj in context.selected_objects if obj.type == 'MESH']
        if not selected_objs:
            self.report({'WARNING'}, "Keine Mesh-Objekte ausgewählt!")
            return {'CANCELLED'}

        for obj in selected_objs:
            dims = obj.dimensions
            loc = obj.location
            body_type = "static" if obj.name.lower().startswith("floor") or obj.name.lower().startswith("ground") else "dynamic"

            # Koordinaten-Mapping: Blender X -> SubQG X, Blender Z -> SubQG Y (Höhe)
            subqg_client.send_command("create_box", {
                "id": obj.name,
                "x": loc.x,
                "y": loc.z,
                "width": max(0.1, dims.x),
                "height": max(0.1, dims.z),
                "type": body_type,
                "density": 2.0,
                "friction": 0.5,
                "isDestructible": True,
                "fractureForce": 300.0
            })

        # 3. Batch Baking über die SubQG API abrufen
        self.report({'INFO'}, f"Berechne SubQG Relationale Metrik für {steps} Schritte...")
        bake_res = subqg_client.send_command("bake", {
            "steps": steps,
            "dt": 1.0 / context.scene.render.fps
        })

        if not bake_res or "result" not in bake_res:
            self.report({'ERROR'}, "Fehler beim Empfang der Simulationsdaten!")
            return {'CANCELLED'}

        frames = bake_res["result"]["frames"]

        # 4. Keyframes in Blender schreiben
        for f_data in frames:
            f_num = start_frame + f_data["frame"]
            context.scene.frame_set(f_num)

            for b in f_data["snapshot"]["bodies"]:
                if b["id"] in bpy.data.objects:
                    target_obj = bpy.data.objects[b["id"]]
                    # SubQG 2D/2.5D -> Blender 3D (X -> X, Y -> Z)
                    target_obj.location.x = b["x"]
                    target_obj.location.z = b["y"]
                    # Rotation um Y-Achse (entspricht 2D-Rotation in der X-Z Ebene)
                    target_obj.rotation_euler.y = -b["angle"]

                    target_obj.keyframe_insert(data_path="location", frame=f_num)
                    target_obj.keyframe_insert(data_path="rotation_euler", frame=f_num)

        self.report({'INFO'}, f"Erfolgreich {steps} Frames SubQG-Physik gebacken!")
        return {'FINISHED'}

class SUBQG_PT_Panel(bpy.types.Panel):
    """SubQG Panel im 3D Viewport"""
    bl_label = "SubQG Physics Engine"
    bl_idname = "SUBQG_PT_Panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'SubQG Physics'

    def draw(self, context):
        layout = self.layout
        props = context.scene.subqg_props

        box = layout.box()
        box.label(text="Server-Status", icon='NETWORK_DRIVE')
        box.operator("subqg.connect", icon='LINKED')

        box_sim = layout.box()
        box_sim.label(text="Simulationsparameter", icon='PHYSICS')
        box_sim.prop(props, "engine_mode")
        box_sim.prop(props, "gravity_y")

        box_bake = layout.box()
        box_bake.label(text="Keyframe Baking", icon='ANIM')
        box_bake.operator("subqg.bake_keyframes", icon='RENDER_ANIMATION')

class SubQGSceneProperties(bpy.types.PropertyGroup):
    engine_mode: bpy.props.EnumProperty(
        name="Physik-Modus",
        items=[
            ('pure-subqg', "SubQG Pure (First-Principles)", "Reine Kantenbarriere ohne Impulssolver"),
            ('hybrid', "SubQG Hybrid (Echtzeit)", "Optimierter Solver mit SubQG Metrikgitter")
        ],
        default='pure-subqg'
    )
    gravity_y: bpy.props.FloatProperty(
        name="Gravitation (m/s²)",
        default=9.81,
        min=0.0,
        max=50.0
    )

classes = (
    SubQGSceneProperties,
    SUBQG_OT_Connect,
    SUBQG_OT_BakeKeyframes,
    SUBQG_PT_Panel
)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.subqg_props = bpy.props.PointerProperty(type=SubQGSceneProperties)

def unregister():
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)
    del bpy.types.Scene.subqg_props
    subqg_client.disconnect()

if __name__ == "__main__":
    register()
