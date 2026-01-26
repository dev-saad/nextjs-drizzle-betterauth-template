ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "avatar_url" TO "image";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "users_email_key";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "users_phone_key";--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_check";--> statement-breakpoint
DROP INDEX "idx_inventory_transactions_product";--> statement-breakpoint
DROP INDEX "idx_inventory_transactions_variant";--> statement-breakpoint
DROP INDEX "idx_orders_org_status_created";--> statement-breakpoint
DROP INDEX "idx_products_org_status";--> statement-breakpoint
DROP INDEX "categories_org_name_unique";--> statement-breakpoint
DROP INDEX "customers_org_email_unique";--> statement-breakpoint
DROP INDEX "customers_org_phone_unique";--> statement-breakpoint
DROP INDEX "orders_org_number_unique";--> statement-breakpoint
DROP INDEX "product_variants_unique_sku";--> statement-breakpoint
DROP INDEX "products_org_sku_unique";--> statement-breakpoint
DROP INDEX "purchase_orders_org_number_unique";--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "access_token_expires_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "refresh_token_expires_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "created_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "inventory_transactions" drop column "total_amount";--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "total_amount" numeric(12, 2) GENERATED ALWAYS AS ((subtotal_amount - discount_amount + delivery_charge)) STORED;--> statement-breakpoint
ALTER TABLE "order_items" drop column "total";--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "total" numeric(12, 2) GENERATED ALWAYS AS (((quantity * price) - discount_amount)) STORED;--> statement-breakpoint
ALTER TABLE "orders" drop column "total_amount";--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "total_amount" numeric(12, 2) GENERATED ALWAYS AS ((subtotal_amount - discount_amount + delivery_charge + tax_amount)) STORED;--> statement-breakpoint
ALTER TABLE "organization_members" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "purchase_order_items" drop column "total";--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD COLUMN "total" numeric(12, 2) GENERATED ALWAYS AS ((quantity::numeric * price)) STORED;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "expires_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "expires_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
CREATE UNIQUE INDEX "categories_org_name_unique" ON "categories" USING btree ("organization_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_org_email_unique" ON "customers" USING btree ("organization_id","email") WHERE email IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "customers_org_phone_unique" ON "customers" USING btree ("organization_id","phone") WHERE phone IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "orders_org_number_unique" ON "orders" USING btree ("organization_id","order_number");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_unique_sku" ON "product_variants" USING btree ("product_id","sku") WHERE sku IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "products_org_sku_unique" ON "products" USING btree ("organization_id","sku") WHERE sku IS NOT NULL AND has_variants = false;--> statement-breakpoint
CREATE UNIQUE INDEX "purchase_orders_org_number_unique" ON "purchase_orders" USING btree ("organization_id","order_number");--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "password_hash";--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_stock_quantity_check" CHECK (((has_variants = false AND stock_quantity >= 0) OR (has_variants = true AND stock_quantity = 0)));--> statement-breakpoint
DROP POLICY "org_isolation_products" ON "products" CASCADE;