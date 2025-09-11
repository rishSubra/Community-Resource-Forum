RENAME TABLE `organizations` TO `organization`;--> statement-breakpoint
RENAME TABLE `users_to_tags` TO `subscription`;--> statement-breakpoint
ALTER TABLE `organization` DROP CONSTRAINT `profile_is_organization`;--> statement-breakpoint
ALTER TABLE `organization` DROP FOREIGN KEY `organizations_organizationId_profile_id_fk`;
--> statement-breakpoint
ALTER TABLE `organization` DROP FOREIGN KEY `organizations_userId_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `subscription` DROP FOREIGN KEY `users_to_tags_userId_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `subscription` DROP FOREIGN KEY `users_to_tags_tagId_tag_id_fk`;
--> statement-breakpoint
ALTER TABLE `organization` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `subscription` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `event` MODIFY COLUMN `organizerId` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `reply` MODIFY COLUMN `content` text NOT NULL;--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `organization` ADD PRIMARY KEY(`organizationId`,`userId`);--> statement-breakpoint
ALTER TABLE `subscription` ADD PRIMARY KEY(`userId`,`tagId`);--> statement-breakpoint
ALTER TABLE `profile` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `profile` ADD `updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `organization` ADD CONSTRAINT `organization_organizationId_profile_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `profile`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organization` ADD CONSTRAINT `organization_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_tagId_tag_id_fk` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profile` DROP COLUMN `displayName`;