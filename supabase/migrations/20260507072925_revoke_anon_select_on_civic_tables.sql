/*
  # Revoke anon SELECT on civic platform tables

  Removes the `anon` role's ability to SELECT from civic platform tables,
  hiding them from the public GraphQL schema. These tables are only meant
  to be accessed by authenticated users through RLS policies.

  Tables affected:
    - city_heat_index
    - user_alerts
    - user_maps
    - user_pins
    - user_trails
*/

REVOKE SELECT ON public.city_heat_index FROM anon;
REVOKE SELECT ON public.user_alerts FROM anon;
REVOKE SELECT ON public.user_maps FROM anon;
REVOKE SELECT ON public.user_pins FROM anon;
REVOKE SELECT ON public.user_trails FROM anon;

REVOKE INSERT, UPDATE, DELETE ON public.city_heat_index FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.user_alerts FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.user_maps FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.user_pins FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.user_trails FROM anon;
