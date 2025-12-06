-- Ejecuta este comando en el Editor SQL de Supabase para restaurar al usuario admin
INSERT INTO public.usuarios (id, nombres, apellidos, correo, rol, estado, rut)
VALUES (
  'e9a035ba-f570-4fb0-8634-160ebce90762', 
  'Administrador', 
  'Principal', 
  'admin@animas.cl', 
  'admin', 
  'activo', 
  '11.111.111-1'
)
ON CONFLICT (id) DO UPDATE 
SET 
  rol = EXCLUDED.rol, 
  estado = EXCLUDED.estado,
  rut = EXCLUDED.rut;
