CREATE TABLE `flag` (
	`userId` varchar(255) NOT NULL,
	`postId` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `flag_userId_postId_pk` PRIMARY KEY(`userId`,`postId`)
);
--> statement-breakpoint
ALTER TABLE `flag` ADD CONSTRAINT `flag_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flag` ADD CONSTRAINT `flag_postId_post_id_fk` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE cascade ON UPDATE no action;