CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`key_hash` text NOT NULL,
	`key_prefix` text NOT NULL,
	`user_id` text,
	`created_by` text,
	`is_active` integer DEFAULT true,
	`last_used_at` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `api_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`api_key_id` text,
	`user_id` text,
	`endpoint` text NOT NULL,
	`method` text NOT NULL,
	`tokens_used` integer DEFAULT 0,
	`latency_ms` integer,
	`status_code` integer,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`api_key_id`) REFERENCES `api_keys`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `api_usage_daily` (
	`id` text PRIMARY KEY NOT NULL,
	`api_key_id` text,
	`user_id` text,
	`date` text NOT NULL,
	`total_requests` integer DEFAULT 0,
	`total_tokens` integer DEFAULT 0,
	`avg_latency_ms` integer,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`api_key_id`) REFERENCES `api_keys`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `companion_config` (
	`id` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	`name` text DEFAULT 'Aura' NOT NULL,
	`default_gender` text DEFAULT 'female',
	`custom_gender_text` text,
	`default_length` text DEFAULT 'moderate',
	`default_style` text DEFAULT 'thoughtful',
	`brief_tokens` integer DEFAULT 500,
	`moderate_tokens` integer DEFAULT 1000,
	`detailed_tokens` integer DEFAULT 2000,
	`brief_instruction` text DEFAULT 'Keep your responses concise and to the point, typically 1-3 sentences.',
	`moderate_instruction` text DEFAULT 'Provide balanced responses with enough detail to be helpful, typically 2-4 paragraphs.',
	`detailed_instruction` text DEFAULT 'Give comprehensive, in-depth responses with thorough explanations and examples.',
	`casual_instruction` text DEFAULT 'Use a warm, friendly, and conversational tone. Be approachable and relaxed.',
	`thoughtful_instruction` text DEFAULT 'Be reflective, empathetic, and considerate. Take time to deeply understand and respond with care.',
	`creative_instruction` text DEFAULT 'Be imaginative, expressive, and open to exploring ideas in unique ways. Use vivid language and creative analogies.',
	`system_prompt_template` text DEFAULT 'You are {{companion_name}}, a compassionate, judgment-free AI companion designed for meaningful adult conversations. You provide emotional support, intellectual engagement, and creative exploration in a private, safe environment.

Core principles:
- Be empathetic, understanding, and non-judgmental
- Maintain context and remember previous parts of the conversation
- Provide thoughtful, authentic responses
- Create a safe space for open expression
- Respect the user''s privacy and confidentiality

Your identity:
{{gender_persona}}

Current response preferences:
- Length: {{length_instruction}}
- Style: {{style_instruction}}

Adapt your responses to match these preferences while maintaining your empathetic and supportive nature.' NOT NULL,
	`general_model` text DEFAULT 'darkplanet',
	`long_form_model` text DEFAULT 'darkplanet',
	`temperature` real DEFAULT 0.8,
	`use_long_form_for_detailed` integer DEFAULT true,
	`welcome_title` text DEFAULT 'WELCOME TO TERMINAL COMPANION',
	`welcome_message` text DEFAULT 'This is your private, judgment-free terminal for meaningful conversation.',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `conversation_context` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`summary` text NOT NULL,
	`key_facts` text,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`refresh_token` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `system_prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'default' NOT NULL,
	`content` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`is_active` integer DEFAULT false,
	`created_by` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`notes` text,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`type` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`gender` text,
	`custom_gender` text,
	`preferred_length` text DEFAULT 'moderate',
	`preferred_style` text DEFAULT 'thoughtful',
	`theme_hue` integer DEFAULT 220,
	`use_orange_accent` integer DEFAULT false,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_preferences_user_id_unique` ON `user_preferences` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`display_name` text,
	`chat_name` text,
	`personality_mode` text DEFAULT 'nurturing',
	`storage_preference` text DEFAULT 'cloud',
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`is_admin` integer DEFAULT false,
	`subscription_status` text DEFAULT 'not_subscribed',
	`credits` integer DEFAULT 0,
	`stripe_customer_id` text,
	`stripe_subscription_id` text,
	`account_source` text DEFAULT 'frontend',
	`amplexa_funnel` text,
	`amplexa_funnel_name` text,
	`amplexa_responses` text,
	`amplexa_primary_need` text,
	`amplexa_communication_style` text,
	`amplexa_pace` text,
	`amplexa_tags` text,
	`amplexa_timestamp` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);