PRAGMA foreign_keys=OFF;
--> statement-breakpoint
DROP TABLE IF EXISTS `order_items`;
--> statement-breakpoint
DROP TABLE IF EXISTS `orders`;
--> statement-breakpoint
DROP TABLE IF EXISTS `products`;
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_product_id` text NOT NULL,
	`parent_product_name` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`variant_name` text,
	`description` text,
	`category` text DEFAULT 'Lashes' NOT NULL,
	`price` integer NOT NULL,
	`compare_at_price` integer,
	`inventory` integer DEFAULT 0 NOT NULL,
	`image_url` text,
	`is_featured` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_idx` ON `products` (`slug`);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`fulfillment_status` text DEFAULT 'unfulfilled' NOT NULL,
	`subtotal` integer NOT NULL,
	`total` integer NOT NULL,
	`customer_email` text NOT NULL,
	`customer_name` text,
	`notes` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`price` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=ON;
