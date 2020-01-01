-- Database setup for this site

# run this in mysql prompt before running this entire file:
# CREATE DATABASE IF NOT EXISTS `instruments` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
# then run this in shell prompt(with your data):
# mysql -u username -p password instruments < setup.sql

CREATE TABLE IF NOT EXISTS `accounts` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

INSERT INTO `accounts` (`id`, `username`, `password`) VALUES (1, 'test', 'test');

ALTER TABLE `accounts` ADD PRIMARY KEY (`id`);
ALTER TABLE `accounts` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;