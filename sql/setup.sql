-- Database setup for this site

# run this in mysql prompt before running this entire file:
# CREATE DATABASE IF NOT EXISTS `instruments` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
# then run this in shell prompt(with your data):
# mysql -u username -p password instruments < setup.sql

CREATE TABLE IF NOT EXISTS `accounts` (
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

INSERT INTO `accounts` (`username`, `password`) VALUES ('test', 'test');

ALTER TABLE `accounts` ADD PRIMARY KEY (`username`);

CREATE TABLE IF NOT EXISTS `comments` (
  `id` int(11) NOT NULL,
  `page` varchar(10) NOT NULL,
  `comment` varchar (250) NOT NULL,
  `username` varchar(50) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

ALTER TABLE `comments` ADD PRIMARY KEY (`id`);
ALTER TABLE `comments` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
ALTER TABLE `comments` ADD FOREIGN KEY (`username`) REFERENCES `accounts`(`username`);
