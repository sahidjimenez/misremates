-- Seed data for development
-- Ejecutar después de schema.sql

-- Ejemplo de usuario admin (reemplazar con UUID real de auth.users)
-- update public.users set role = 'admin' where email = 'admin@misremates.com.mx';

-- Actualizar stripe_price_id de los planes después de crearlos en Stripe
-- update public.plans set stripe_price_id = 'price_xxx' where name = 'basico';
-- update public.plans set stripe_price_id = 'price_xxx' where name = 'pro';
-- update public.plans set stripe_price_id = 'price_xxx' where name = 'premium';
