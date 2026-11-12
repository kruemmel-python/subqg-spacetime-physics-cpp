#!/usr/bin/env python3
"""
SubQG Physics Engine - Universal Python Client
==============================================

Verwendbar in beliebigen Python Game Engines (Pygame, Ursina, Arcade, Godot Python).
Keine externen Abhängigkeiten (rein Python Standard-Bibliothek).
"""

import socket
import json
import time

class SubQGClient:
    def __init__(self, host="127.0.0.1", port=3001):
        self.host = host
        self.port = port
        self.sock = None
        self.req_id = 1
        self._buffer = ""

    def connect(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.connect((self.host, self.port))
        return True

    def disconnect(self):
        if self.sock:
            self.sock.close()
            self.sock = None

    def send(self, method, params=None):
        if not self.sock:
            self.connect()

        payload = {
            "id": self.req_id,
            "method": method,
            "params": params or {}
        }
        self.req_id += 1

        msg = json.dumps(payload) + "\n"
        self.sock.sendall(msg.encode("utf-8"))

        while "\n" not in self._buffer:
            chunk = self.sock.recv(4096).decode("utf-8")
            if not chunk:
                break
            self._buffer += chunk

        line, self._buffer = self._buffer.split("\n", 1)
        return json.loads(line)

    def create_world(self, engine_mode="pure-subqg", gravity=(0.0, -9.81)):
        return self.send("create_world", {
            "engineMode": engine_mode,
            "gravity": list(gravity)
        })

    def create_box(self, body_id, x, y, width, height, is_dynamic=True, is_destructible=False, fracture_force=350.0):
        return self.send("create_box", {
            "id": body_id,
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "type": "dynamic" if is_dynamic else "static",
            "isDestructible": is_destructible,
            "fractureForce": fracture_force
        })

    def create_circle(self, body_id, x, y, radius, is_dynamic=True, is_destructible=False):
        return self.send("create_circle", {
            "id": body_id,
            "x": x,
            "y": y,
            "radius": radius,
            "type": "dynamic" if is_dynamic else "static",
            "isDestructible": is_destructible
        })

    def apply_force(self, body_id, fx, fy):
        return self.send("apply_force", {"id": body_id, "fx": fx, "fy": fy})

    def apply_impulse(self, body_id, ix, iy):
        return self.send("apply_impulse", {"id": body_id, "ix": ix, "iy": iy})

    def step(self, dt=1.0/60.0):
        res = self.send("step", {"dt": dt})
        return res.get("result", {})

    def get_state(self):
        res = self.send("get_state")
        return res.get("result", {})


if __name__ == "__main__":
    print("[SubQG Client Demo] Verbinde mit SubQG Physics Server...")
    client = SubQGClient()
    try:
        client.connect()
        print("Erfolgreich verbunden!")

        client.create_world("pure-subqg", (0, -9.81))
        client.create_box("ground", 0, 0, 40, 1.0, is_dynamic=False)
        client.create_box("falling_box", 0, 10, 1.0, 1.0, is_dynamic=True, is_destructible=True)

        print("Simuliere 60 Ticks (1 Sekunde)...")
        for i in range(60):
            state = client.step(1.0 / 60.0)
            if i % 15 == 0:
                box = next((b for b in state.get("bodies", []) if b["id"] == "falling_box"), None)
                if box:
                    print(f"Tick {i:02d}: Box Y={box['y']:.2f} m | Vy={box['vy']:.2f} m/s")

        print("Simulation erfolgreich abgeschlossen!")
    except Exception as e:
        print(f"Fehler: {e} (Läuft 'node tools/start_physics_server.mjs'?)")
    finally:
        client.disconnect()
