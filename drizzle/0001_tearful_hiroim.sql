CREATE TABLE `contactMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderName` varchar(255) NOT NULL,
	`senderEmail` varchar(320) NOT NULL,
	`senderPhone` varchar(20),
	`targetMember` varchar(64) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contactMessages_id` PRIMARY KEY(`id`)
);
