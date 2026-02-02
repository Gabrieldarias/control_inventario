#!/usr/bin/env python3
"""
Script de Pruebas Automatizadas para Sistema de Tienda
Realiza pruebas de todos los módulos sin necesidad de interfaz gráfica
"""

import requests
import json
from datetime import datetime, timedelta
import time

BASE_URL = "http://localhost:3001"
ADMIN_TOKEN = None
VENDEDOR_TOKEN = None

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    YELLOW = '\033[93m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}{Colors.RESET}\n")

def print_success(text):
    print(f"{Colors.GREEN}✅ {text}{Colors.RESET}")

def print_error(text):
    print(f"{Colors.RED}❌ {text}{Colors.RESET}")

def print_info(text):
    print(f"{Colors.YELLOW}ℹ️  {text}{Colors.RESET}")

def print_test(text):
    print(f"{Colors.BOLD}→ {text}{Colors.RESET}")

def login_admin():
    """Prueba 1: Login como Admin"""
    global ADMIN_TOKEN
    print_header("PRUEBA 1: LOGIN ADMINISTRADOR")
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@example.com",
            "password": "adminpass"
        })
        
        if response.status_code == 200:
            data = response.json()
            ADMIN_TOKEN = data.get('token')
            print_success(f"Login exitoso")
            print_info(f"Token: {ADMIN_TOKEN[:20]}...")
            return True
        else:
            print_error(f"Login fallido: {response.status_code}")
            print_error(f"Respuesta: {response.text}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def login_vendedor():
    """Prueba 2: Login como Vendedor"""
    global VENDEDOR_TOKEN
    print_header("PRUEBA 2: LOGIN VENDEDOR")
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "vendedor@example.com",
            "password": "vendedorpass"
        })
        
        if response.status_code == 200:
            data = response.json()
            VENDEDOR_TOKEN = data.get('token')
            print_success(f"Login exitoso")
            print_info(f"Token: {VENDEDOR_TOKEN[:20]}...")
            return True
        else:
            print_error(f"Login fallido: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_productos():
    """Prueba 3: Gestión de Productos"""
    print_header("PRUEBA 3: GESTIÓN DE PRODUCTOS")
    
    headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
    
    try:
        # Listar productos
        print_test("Listando productos...")
        response = requests.get(f"{BASE_URL}/api/inventory/productos", headers=headers)
        if response.status_code == 200:
            productos = response.json()
            print_success(f"Se encontraron {len(productos)} productos")
            for p in productos[:3]:
                print_info(f"  - {p.get('nombre')} (Stock: {p.get('stock_total')})")
        else:
            print_error(f"Fallo al listar productos: {response.status_code}")
            return False
        
        # Crear producto
        print_test("Creando nuevo producto...")
        nuevo_producto = {
            "nombre": f"Producto Test {datetime.now().strftime('%H%M%S')}",
            "codigo_interno": f"TEST-{datetime.now().strftime('%H%M%S')}",
            "categoria_id": 1,
            "precio_costo": 50,
            "precio_venta": 100,
            "stock_minimo": 5
        }
        response = requests.post(f"{BASE_URL}/api/inventory/productos", 
                                json=nuevo_producto, headers=headers)
        if response.status_code == 201:
            producto_creado = response.json()
            print_success(f"Producto creado: {producto_creado.get('nombre')}")
            return True
        else:
            print_error(f"Fallo al crear producto: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_ventas():
    """Prueba 4: Crear Venta"""
    print_header("PRUEBA 4: MÓDULO VENTAS")
    
    headers = {"Authorization": f"Bearer {VENDEDOR_TOKEN}"}
    
    try:
        # Crear venta
        print_test("Creando venta...")
        venta = {
            "items": [
                {"producto_id": 1, "cantidad": 2, "precio_unitario": 599}
            ],
            "total": 1198
        }
        response = requests.post(f"{BASE_URL}/api/sales", json=venta, headers=headers)
        if response.status_code == 201:
            venta_creada = response.json()
            print_success(f"Venta creada: ID {venta_creada.get('id')}")
            return True
        else:
            print_error(f"Fallo al crear venta: {response.status_code}")
            print_error(f"Respuesta: {response.text}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_compras():
    """Prueba 5: Crear Compra"""
    print_header("PRUEBA 5: MÓDULO COMPRAS")
    
    headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
    
    try:
        # Crear compra
        print_test("Creando compra...")
        compra = {
            "proveedor_id": 1,
            "items": [
                {"producto_id": 2, "cantidad": 5, "precio": 8}
            ]
        }
        response = requests.post(f"{BASE_URL}/api/compras", json=compra, headers=headers)
        if response.status_code == 201:
            compra_creada = response.json()
            print_success(f"Compra creada: ID {compra_creada.get('id')}")
            return True
        else:
            print_error(f"Fallo al crear compra: {response.status_code}")
            print_error(f"Respuesta: {response.text}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_devoluciones():
    """Prueba 6: Crear Devolución"""
    print_header("PRUEBA 6: MÓDULO DEVOLUCIONES")
    
    headers = {"Authorization": f"Bearer {VENDEDOR_TOKEN}"}
    
    try:
        # Crear devolución
        print_test("Creando devolución...")
        devolucion = {
            "tipo": "cliente",
            "referencia_original": "1",
            "motivo": "Defectuoso",
            "items": [
                {"producto_id": 1, "cantidad": 1, "precio": 599}
            ]
        }
        response = requests.post(f"{BASE_URL}/api/devoluciones", json=devolucion, headers=headers)
        if response.status_code == 201:
            devolucion_creada = response.json()
            print_success(f"Devolución creada: ID {devolucion_creada.get('id')}")
            return True
        else:
            print_error(f"Fallo al crear devolución: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_usuarios():
    """Prueba 7: Gestión de Usuarios"""
    print_header("PRUEBA 7: GESTIÓN DE USUARIOS")
    
    headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
    
    try:
        # Listar usuarios
        print_test("Listando usuarios...")
        response = requests.get(f"{BASE_URL}/api/usuarios", headers=headers)
        if response.status_code == 200:
            usuarios = response.json()
            print_success(f"Se encontraron {len(usuarios)} usuarios")
            for u in usuarios[:3]:
                print_info(f"  - {u.get('nombre')} ({u.get('role')})")
        else:
            print_error(f"Fallo al listar usuarios: {response.status_code}")
            return False
        
        # Crear usuario
        print_test("Creando nuevo usuario...")
        nuevo_usuario = {
            "nombre": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"test-{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPassword123",
            "role": "vendedor"
        }
        response = requests.post(f"{BASE_URL}/api/usuarios", 
                                json=nuevo_usuario, headers=headers)
        if response.status_code == 201:
            usuario_creado = response.json()
            print_success(f"Usuario creado: {usuario_creado.get('nombre')}")
            return True
        else:
            print_error(f"Fallo al crear usuario: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_reportes():
    """Prueba 8: Reportes"""
    print_header("PRUEBA 8: REPORTES")
    
    headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
    
    try:
        # Reporte de Stock
        print_test("Obteniendo reporte de stock...")
        response = requests.get(f"{BASE_URL}/api/inventory/reportes/stock-actual", headers=headers)
        if response.status_code == 200:
            reportes = response.json()
            print_success(f"Reporte de stock: {len(reportes)} productos")
            return True
        else:
            print_error(f"Fallo al obtener reporte: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def main():
    print(f"{Colors.BOLD}{Colors.BLUE}")
    print("╔════════════════════════════════════════════════════════════╗")
    print("║        🧪 PRUEBAS AUTOMATIZADAS SISTEMA TIENDA 🧪          ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print(f"{Colors.RESET}")
    
    print_info(f"URL Base: {BASE_URL}")
    print_info(f"Iniciando pruebas a las {datetime.now().strftime('%H:%M:%S')}")
    
    # Verificar conexión
    print_test("Verificando conexión al servidor...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        print_success("Servidor accesible")
    except requests.exceptions.ConnectionError:
        print_error(f"No se puede conectar a {BASE_URL}")
        print_error("Asegúrate de que el servidor backend está corriendo")
        return
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return
    
    # Ejecutar pruebas
    resultados = []
    
    resultados.append(("Login Admin", login_admin()))
    time.sleep(0.5)
    
    resultados.append(("Login Vendedor", login_vendedor()))
    time.sleep(0.5)
    
    if ADMIN_TOKEN:
        resultados.append(("Productos", test_productos()))
        time.sleep(0.5)
    
    if VENDEDOR_TOKEN:
        resultados.append(("Ventas", test_ventas()))
        time.sleep(0.5)
    
    if ADMIN_TOKEN:
        resultados.append(("Compras", test_compras()))
        time.sleep(0.5)
    
    if VENDEDOR_TOKEN:
        resultados.append(("Devoluciones", test_devoluciones()))
        time.sleep(0.5)
    
    if ADMIN_TOKEN:
        resultados.append(("Usuarios", test_usuarios()))
        time.sleep(0.5)
        resultados.append(("Reportes", test_reportes()))
    
    # Resumen
    print_header("RESUMEN DE RESULTADOS")
    exitosas = sum(1 for _, resultado in resultados if resultado)
    total = len(resultados)
    
    for nombre, resultado in resultados:
        if resultado:
            print_success(nombre)
        else:
            print_error(nombre)
    
    print(f"\n{Colors.BOLD}Total: {exitosas}/{total} pruebas exitosas{Colors.RESET}")
    
    if exitosas == total:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ¡TODAS LAS PRUEBAS PASARON!{Colors.RESET}\n")
    else:
        print(f"\n{Colors.YELLOW}⚠️  Algunas pruebas fallaron. Revisa los errores arriba.{Colors.RESET}\n")

if __name__ == "__main__":
    main()
