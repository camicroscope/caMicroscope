-- phpMyAdmin SQL Dump
-- version 3.4.10.1deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Aug 08, 2012 at 05:52 PM
-- Server version: 5.5.24
-- PHP Version: 5.3.10-1ubuntu3.2

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `bio`
--

-- --------------------------------------------------------

--
-- Table structure for table `annotation`
--

CREATE TABLE IF NOT EXISTS `annotation` (
  `aid` int(16) NOT NULL AUTO_INCREMENT,
  `iid` int(8) NOT NULL,
  `x` float NOT NULL,
  `y` float NOT NULL,
  `w` float NOT NULL,
  `h` float NOT NULL,
  `type` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL,
  `points` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`aid`),
  KEY `iid` (`iid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=48 ;

--
-- Dumping data for table `annotation`
--

INSERT INTO `annotation` (`aid`, `iid`, `x`, `y`, `w`, `h`, `type`, `points`, `text`) VALUES
(1, 1, 0.2, 0.198068, 0.09, 0.0531401, 'rect', '', 'hohohoho'),
(43, 1, 0.388, 0.227053, 0.045, 0.154589, 'rect', '', 'hey'),
(44, 1, 0.581, 0.256039, 0.046, 0.0917874, 'ellipse', '', 'hey'),
(45, 2, 0.128, 0.2657, 0.075, 0.289855, 'rect', '', 'haha'),
(46, 2, 0.315, 0.357488, 0.0225, 0.0942029, 'rect', '', 'yo');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `annotation`
--
ALTER TABLE `annotation`
  ADD CONSTRAINT `annotation_ibfk_1` FOREIGN KEY (`iid`) REFERENCES `image` (`iid`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
