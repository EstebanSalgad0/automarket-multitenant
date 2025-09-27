-- =====================================================
-- PANORAMA COMPLETO DE BASE DE DATOS - AUTOMARKET MULTITENANT
-- =====================================================
-- Ejecutar cada sección por separado y exportar como CSV

-- =====================================================
-- 1) COLUMNAS POR TABLA
-- =====================================================
-- Archivo: 01_columnas_por_tabla.csv
select
  c.table_schema as esquema,
  c.table_name as tabla,
  c.column_name as columna,
  c.data_type as tipo_dato,
  c.is_nullable as permite_null,
  c.column_default as valor_default
from information_schema.columns c
where c.table_schema = 'public'
order by c.table_name, c.ordinal_position;

-- =====================================================
-- 2) PRIMARY KEYS
-- =====================================================
-- Archivo: 02_primary_keys.csv
select
  tc.table_name as tabla,
  kcu.column_name as columna_pk
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  using (constraint_name, table_schema)
where tc.table_schema = 'public'
  and tc.constraint_type = 'PRIMARY KEY'
order by tc.table_name, kcu.ordinal_position;

-- =====================================================
-- 3) FOREIGN KEYS
-- =====================================================
-- Archivo: 03_foreign_keys.csv
select
  tc.table_name as tabla_origen,
  kcu.column_name as columna_origen,
  ccu.table_name as tabla_referenciada,
  ccu.column_name as columna_referenciada
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  using (constraint_name, table_schema)
join information_schema.constraint_column_usage ccu
  using (constraint_name, table_schema)
where tc.table_schema = 'public'
  and tc.constraint_type = 'FOREIGN KEY'
order by tc.table_name, kcu.column_name;

-- =====================================================
-- 4) INDEXES
-- =====================================================
-- Archivo: 04_indexes.csv
select
  schemaname as esquema,
  tablename as tabla,
  indexname as nombre_indice,
  indexdef as definicion_indice
from pg_indexes
where schemaname = 'public'
order by tablename, indexname;

-- =====================================================
-- 5) RLS POLICIES (ROW LEVEL SECURITY)
-- =====================================================
-- Archivo: 05_rls_policies.csv
select
  schemaname as esquema,
  tablename as tabla,
  policyname as nombre_politica,
  permissive as tipo_permiso,
  roles as roles,
  cmd as comando,
  qual as condicion_using,
  with_check as condicion_with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- =====================================================
-- 6) ENUMS (TIPOS ENUMERADOS)
-- =====================================================
-- Archivo: 06_enums.csv
select
  n.nspname as esquema,
  t.typname as nombre_enum,
  e.enumlabel as valor
from pg_type t
join pg_enum e on t.oid = e.enumtypid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public'
order by t.typname, e.enumsortorder;

-- =====================================================
-- 7) FUNCIONES/RPC
-- =====================================================
-- Archivo: 07_funciones.csv
select
  p.proname as nombre_funcion,
  pg_get_function_identity_arguments(p.oid) as argumentos,
  pg_get_functiondef(p.oid) as definicion_completa
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by p.proname;

-- =====================================================
-- 8) RESUMEN DE TABLAS Y REGISTROS
-- =====================================================
-- Archivo: 08_resumen_tablas.csv
select 
  schemaname as esquema,
  tablename as tabla,
  tableowner as propietario,
  hasindexes as tiene_indices,
  hasrules as tiene_reglas,
  hastriggers as tiene_triggers
from pg_tables
where schemaname = 'public'
order by tablename;