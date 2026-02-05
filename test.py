import re

def limpiar_css(archivo_entrada, archivo_salida=None):
    """
    Lee un archivo CSS y elimina todas las propiedades decorativas
    dejando solo lo esencial para una página simple y rápida
    
    Args:
        archivo_entrada: ruta del archivo CSS a procesar
        archivo_salida: ruta donde guardar el resultado (opcional)
    """
    
    if archivo_salida is None:
        archivo_salida = archivo_entrada
    
    with open(archivo_entrada, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # ============ BORDES Y ESQUINAS ============
    # Border-radius
    contenido = re.sub(r'\s*-?\w*-?border-radius\s*:[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    
    # ============ TRANSPARENCIAS ============
    contenido = re.sub(r'\s*opacity\s*:[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    
    # Convertir rgba a rgb
    def reemplazar_rgba(match):
        valores = match.group(1)
        partes = [v.strip() for v in valores.split(',')]
        if len(partes) == 4:
            return f"rgb({partes[0]}, {partes[1]}, {partes[2]})"
        return match.group(0)
    
    contenido = re.sub(r'rgba\s*\(([^)]+)\)', reemplazar_rgba, contenido, flags=re.IGNORECASE)
    
    # Convertir hsla a hsl
    def reemplazar_hsla(match):
        valores = match.group(1)
        partes = [v.strip() for v in valores.split(',')]
        if len(partes) == 4:
            return f"hsl({partes[0]}, {partes[1]}, {partes[2]})"
        return match.group(0)
    
    contenido = re.sub(r'hsla\s*\(([^)]+)\)', reemplazar_hsla, contenido, flags=re.IGNORECASE)
    
    # ============ SOMBRAS ============
    contenido = re.sub(r'\s*-?\w*-?box-shadow\s*:[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    contenido = re.sub(r'\s*-?\w*-?text-shadow\s*:[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    contenido = re.sub(r'\s*filter\s*:\s*drop-shadow[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    
    # ============ GRADIENTES ============
    contenido = re.sub(r'\s*background(-image)?\s*:\s*(-webkit-|-moz-|-o-|-ms-)?linear-gradient[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    contenido = re.sub(r'\s*background(-image)?\s*:\s*(-webkit-|-moz-|-o-|-ms-)?radial-gradient[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    contenido = re.sub(r'\s*background(-image)?\s*:\s*(-webkit-|-moz-|-o-|-ms-)?conic-gradient[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    contenido = re.sub(r'\s*background(-image)?\s*:\s*(-webkit-|-moz-|-o-|-ms-)?repeating-linear-gradient[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    contenido = re.sub(r'\s*background(-image)?\s*:\s*(-webkit-|-moz-|-o-|-ms-)?repeating-radial-gradient[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    
    # ============ TRANSFORMACIONES ============
    contenido = re.sub(r'\s*-?\w*-?transform\s*:[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    contenido = re.sub(r'\s*-?\w*-?transform-origin\s*:[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    contenido = re.sub(r'\s*-?\w*-?perspective\s*:[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    
    # ============ TRANSICIONES Y ANIMACIONES ============
    contenido = re.sub(r'\s*-?\w*-?transition(-\w+)?\s*:[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    contenido = re.sub(r'\s*-?\w*-?animation(-\w+)?\s*:[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    
    # Eliminar @keyframes completos
    contenido = re.sub(r'@(-webkit-|-moz-|-o-|-ms-)?keyframes\s+[^{]+\{[^}]*(\{[^}]*\}[^}]*)*\}', '', contenido, flags=re.IGNORECASE)
    
    # ============ FILTROS ============
    contenido = re.sub(r'\s*-?\w*-?filter\s*:[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    contenido = re.sub(r'\s*-?\w*-?backdrop-filter\s*:[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    
    # ============ EFECTOS VISUALES MODERNOS ============
    contenido = re.sub(r'\s*-?\w*-?clip-path\s*:[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    contenido = re.sub(r'\s*-?\w*-?mask(-\w+)?\s*:[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    contenido = re.sub(r'\s*mix-blend-mode\s*:[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    contenido = re.sub(r'\s*background-blend-mode\s*:[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    
    # ============ IMÁGENES DE FONDO ============
    # (Opcional - descomenta si quieres eliminar imágenes de fondo)
    # contenido = re.sub(r'\s*background-image\s*:\s*url[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    
    # ============ FUENTES PERSONALIZADAS ============
    # Eliminar @font-face
    contenido = re.sub(r'@font-face\s*\{[^}]*\}', '', contenido, flags=re.IGNORECASE)
    
    # ============ CURSORES PERSONALIZADOS ============
    contenido = re.sub(r'\s*cursor\s*:\s*url[^;]+;?\s*', '', contenido, flags=re.IGNORECASE)
    
    # ============ LIMPIAR REGLAS VACÍAS ============
    # Eliminar reglas CSS que quedaron vacías
    contenido = re.sub(r'[^}]*\{\s*\}', '', contenido)
    
    # Limpiar líneas vacías múltiples
    contenido = re.sub(r'\n\s*\n\s*\n+', '\n\n', contenido)
    
    # Guardar
    with open(archivo_salida, 'w', encoding='utf-8') as f:
        f.write(contenido)
    
    print(f"✓ CSS simplificado correctamente")
    print(f"  Elementos eliminados:")
    print(f"  ✗ Border-radius")
    print(f"  ✗ Transparencias (opacity, rgba, hsla)")
    print(f"  ✗ Sombras (box-shadow, text-shadow)")
    print(f"  ✗ Gradientes")
    print(f"  ✗ Transformaciones")
    print(f"  ✗ Transiciones y animaciones")
    print(f"  ✗ Filtros y efectos")
    print(f"  ✗ Fuentes personalizadas (@font-face)")
    print(f"  ✗ Cursores personalizados")
    print(f"  → Guardado en: {archivo_salida}")


if __name__ == "__main__":
    #limpiar_css("estilos.css")
    limpiar_css("minimal.css", "minimal_super.css")