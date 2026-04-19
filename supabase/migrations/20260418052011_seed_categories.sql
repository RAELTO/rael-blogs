-- ============================================================
-- Seed: default categories
-- ============================================================

insert into public.categories (name, slug) values
  ('Narrativa Digital',  'narrativa-digital'),
  ('Multimedia',         'multimedia'),
  ('Cultura 8-bit',      'cultura-8-bit'),
  ('Hipermedia',         'hipermedia'),
  ('Interactividad',     'interactividad'),
  ('Análisis Lógico',    'analisis-logico')
on conflict (slug) do nothing;
