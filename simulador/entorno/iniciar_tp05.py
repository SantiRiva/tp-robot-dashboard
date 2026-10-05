"""Arranque coordinado del TP05: no inicia procesos si hay un conflicto."""
import argparse
import json
import socket
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parent

def robot_actual():
    try:
        with socket.create_connection(('127.0.0.1', 8765), timeout=1) as sock:
            sock.sendall(b'{"orden":"hola"}\n')
            with sock.makefile('rb') as stream:
                return json.loads(stream.readline()).get('robot')
    except (OSError, ValueError):
        return None

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--robot', choices=['go2', 'g1'], required=True)
    args = parser.parse_args()
    current = robot_actual()
    if current and current != args.robot:
        print(f'Ya hay un simulador {current.upper()} abierto. Cerralo antes de elegir {args.robot.upper()}.')
        return 1
    backend = None
    with socket.socket() as check:
        occupied = check.connect_ex(('127.0.0.1', 8001)) == 0
    if occupied:
        try:
            with urllib.request.urlopen('http://127.0.0.1:8001/info', timeout=2) as response:
                backend = json.load(response)
        except (OSError, ValueError):
            print('El puerto 8001 esta ocupado por otro servicio. Cerralo antes de iniciar el TP.')
            return 1
        if backend.get('modelo') != args.robot or backend.get('modo') != 'simulador':
            print(f'El backend abierto corresponde a {backend.get("modelo", "otro servicio")}.')
            print('Cerra la consola de ese backend con Ctrl+C y volve a ejecutar este lanzador.')
            return 1
    sim = None
    try:
        if not current:
            sim = subprocess.Popen([sys.executable, '-m', 'sim', '--robot', args.robot, '--materia', 'tp05'], cwd=BASE)
        deadline = time.monotonic() + 30
        while robot_actual() != args.robot:
            if (sim and sim.poll() is not None) or time.monotonic() > deadline:
                print('El simulador no pudo iniciar. Revisa los mensajes anteriores.')
                return 1
            time.sleep(0.25)
        if backend:
            print('Backend existente reutilizado: http://localhost:8001')
            if sim:
                print('Deja esta consola abierta mientras usas el simulador.')
                sim.wait()
            return 0
        return subprocess.call([sys.executable, str(BASE / 'arrancar_api.py'), '--robot', args.robot], cwd=BASE)
    except KeyboardInterrupt:
        return 0
    finally:
        if sim and sim.poll() is None:
            sim.terminate()
            sim.wait(timeout=5)

if __name__ == '__main__':
    raise SystemExit(main())
